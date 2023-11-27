//for starting the server ....
const express = require("express");
// for connecting with dataabse without mongodb client
const mongoose = require("mongoose");
//this is for creating jwt token while user is logging in .....
const jwt = require("jsonwebtoken");
//this is for parsing the cookie which are were attached during login........and are coming back with each request of user...
const cookieParser = require("cookie-parser");
//this is used for parsing data from body
const bodyParser = require("body-parser");
const app = express();
//syntax of cookiee parser..
app.use(cookieParser());
// this is secret key that will be used for verifying jwt token
const secretKey = "your-secret-key";
app.use(bodyParser.json());

//handling route of home and sending some response based on that....
app.get("/", (request, response) => {
  response.send({ message: "Hello from an Express API!" });
});
// Define a Task model
// we have defined a model of task and if our code is connected to db  , so automatically a collection will be created
const Task = mongoose.model("Task", {
  taskName: String,
  description: String,
  dueDate: Date,
  status: String,
});

// Create an array of around 50 dummy tasks
const dummyTasks = Array.from({ length: 50 }, (_, index) => ({
  taskName: `Task ${index + 1}`,
  description: `Description for Task ${index + 1}`,
  dueDate: new Date(`2023-11-${index + 1}`),
  status: index % 2 === 0 ? "Incomplete" : "Complete",
}));

// creating a user model
const User = mongoose.model("User", {
  username: { type: String, unique: true },
  password: String,
});

app.post("/signup", async (req, res, next) => {
  // const payload = { username: "harshjha1234", password: "password123" };
  const { username, password } = req.body;
  console.log("request body is : ", req.body);
  const payload = { username, password };
  try {
    const newUser = new User(payload);
    await newUser.save();
    res.status(200).json({
      success: true,
      message: "User Created Successfully",
      user: newUser,
    });
  } catch (error) {
    console.log(error);
    res
      .status(400)
      .json({ message: "Username already taken or invalid input" });
  }
});

//login flow

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (user) {
      const token = jwt.sign(
        { id: user._id, username: user.username },
        secretKey,
        { expiresIn: "30d" }
      );
      const oneHourFromNow = new Date(Date.now() + 3600000); // 3600000 milliseconds = 1 hour

      // Set the token as an HTTP-only cookie with an expiration time
      res.cookie("authorizationCookie", token, {
        httpOnly: true,
        expires: oneHourFromNow,
      });
      res.json({ token: token, user: user });
    }
  } catch (error) {
    console.log(error);
  }
});

function authenticateToken(req, res, next) {
  const token = req.cookies.authorizationCookie;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized: Missing token" });
  }

  jwt.verify(token, "your-secret-key", (err, decoded) => {
    if (decoded) {
      req.user = decoded;
      console.log(req.user);
      next();
    }
    if (err) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    // Attach the decoded user information to the request
  });
}

app.get("/logout", authenticateToken, (req, res) => {
  // Clear the authorization cookie
  res.clearCookie("authorizationCookie");

  // Optionally, you can redirect the user to a logout success page or another destination
  res.redirect("/logout-success");
});

//getting all data from api......
app.get("/task", authenticateToken, async (req, res) => {
  const pageNo = req.query.pageNo;
  const Limit = req.query.Limit;

  try {
    const tasks = await Task.find().skip(pageNo).limit(Limit);
    res.status(200).json({
      success: true,
      Limit: Limit,
      pageNo: pageNo,
      message: "Tasks retrieved successfull",
      data: tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

app.get("/task/:TaskId", authenticateToken, async (req, res, next) => {
  const id = req.params.TaskId;
  try {
    const response = await Task.findById(id);
    res.json({ task: response });
  } catch (error) {
    res.send(error);
  }
});

//adding data to database......
app.post("/taskadd", authenticateToken, async (req, res, next) => {
  // let new_data = new Task({
  //   taskName: "Task A",
  //   description: "Description for Task A",
  //   dueDate: "2023-12-31",
  //   status: "Incomplete",
  // });
  // await new_data.save();
  try {
    const { taskName, description, dueDate, status } = req.body;
    const newTask = new Task({ taskName, description, dueDate, status });
    await newTask.save();
    res.status(201).json({
      success: true,
      message: "Task added successfully",
      data: newTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
});

// deleting from the databse...Task....

// api for deleting task
app.delete(
  "/deleteTask/:deleteId",
  authenticateToken,
  async (req, res, next) => {
    const deleteId = req.params.deleteId;

    // Check if deleteId is a valid ObjectId (assuming MongoDB _id field)
    if (!mongoose.Types.ObjectId.isValid(deleteId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Task ID",
      });
    }
    try {
      const deletedTask = await Task.findById(deleteId);
      const response = await Task.deleteOne({ _id: deleteId });
      if (response.deletedCount === 1) {
        res.status(200).json({
          success: true,
          message: "Task deleted SuccessFully",
          deletedTask: deletedTask,
        }); // 204 No Content for successful deletion
      } else {
        res.status(404).json({
          success: false,
          message: "Task not found",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
        error: error.message,
      });
    }
  }
);

//upating ........
app.post("/updateTask/:taskId", authenticateToken, async (req, res, next) => {
  const { taskName, description, dueDate, status } = req.body;
  const taskId = req.params.taskId;

  try {
    // Check if taskId is a valid ObjectId (assuming MongoDB _id field)
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      return res.status(400).json({ success: false, error: "Invalid Task ID" });
    }

    const existingTask = await Task.findById(taskId);

    if (!existingTask) {
      return res.status(404).json({ success: false, error: "Task not found" });
    }

    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId },
      { taskName, description, dueDate, status },
      { new: true }
    );

    if (updatedTask) {
      return res.json({ success: true, updatedTask });
    } else {
      return res
        .status(500)
        .json({ success: false, error: "Failed to update task" });
    }
  } catch (error) {
    console.error("Error updating task:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
});

// MongoDB connection
mongoose
  .connect(
    "mongodb+srv://admin-harsh:Test123@cluster0.whpfi.mongodb.net/demo?retryWrites=true&w=majority",
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(3000, () => {
      console.log("Server has started on port 3000");
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
