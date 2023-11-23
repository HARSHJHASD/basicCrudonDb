const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const app = express();
const secretKey = "your-secret-key";
app.use(bodyParser.json());
app.get("/", (request, response) => {
  response.send({ message: "Hello from an Express API!" });
});
// Define a Task model
const Task = mongoose.model("Task", {
  taskName: String,
  description: String,
  dueDate: Date,
  status: String,
});

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

//getting all data from api......
app.get("/task", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.status(200).json({
      success: true,
      message: "Tasks retrieved successfully",
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

app.get("/task/:TaskId", async (req, res, next) => {
  const id = req.params.TaskId;
  try {
    const response = await Task.findById(id);
    res.json({ task: response });
  } catch (error) {
    res.send(error);
  }
});

//adding data to database......
app.post("/taskadd", async (req, res, next) => {
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
app.delete("/deleteTask/:deleteId", async (req, res, next) => {
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
});

//upating ........
app.post("/updateTask/:taskId", async (req, res, next) => {
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
