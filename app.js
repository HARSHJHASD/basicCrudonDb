//for starting the server ....
const express = require("express");
// for connecting with dataabse without mongodb client
const mongoose = require("mongoose");
//this is for creating jwt token while user is logging in .....
//this is for parsing the cookie which are were attached during login........and are coming back with each request of user...
const cookieParser = require("cookie-parser");
//this is used for parsing data from body
const bodyParser = require("body-parser");
const app = express();
const TaskController = require("./controllers/TaskController");
const UserController = require("./controllers/UserContoller");
const CorsMiddleware = require("./CORS/CorsMiddleware");
const Authentication = require("./Authentication/AuthenticationMiddleWare");
//syntax of cookiee parser..
app.use(cookieParser());
// this is secret key that will be used for verifying jwt token

app.use(bodyParser.json());
//handling route of home and sending some response based on that....

app.use(CorsMiddleware.CorsMiddleware);

app.get("/", (request, response) => {
  response.send({ message: "Hello from an Express API!" });
});

// Create an array of around 50 dummy tasks
// const dummyTasks = Array.from({ length: 50 }, (_, index) => ({
//   taskName: `Task ${index + 1}`,
//   description: `Description for Task ${index + 1}`,
//   dueDate: new Date(`2023-11-${index + 1}`),
//   status: index % 2 === 0 ? "Incomplete" : "Complete",
// }));

app.post("/signup", UserController.SignupUser);
//login flow
app.post("/login", UserController.LoginUser);

// function authenticateToken(req, res, next) {
//   const token = req.cookies.authorizationCookie;
//   if (!token) {
//     return res.status(401).json({ message: "Unauthorized: Missing token" });
//   }
//   jwt.verify(token, "your-secret-key", (err, decoded) => {
//     if (decoded) {
//       req.user = decoded;
//       console.log(req.user);
//       next();
//     }
//     if (err) {
//       return res.status(401).json({ message: "Unauthorized: Invalid token" });
//     }

//     // Attach the decoded user information to the request
//   });
// }

app.get("/logout", Authentication.authenticateToken, UserController.UserLogout);
//getting all data from api......
app.get("/task", Authentication.authenticateToken, TaskController.TaskGet);
app.get(
  "/task/:TaskId",
  Authentication.authenticateToken,
  TaskController.fetchByIdasync
);
//adding data to database......
app.post("/taskadd", Authentication.authenticateToken, TaskController.addTask);
// deleting from the databse...Task....
// api for deleting task
app.delete(
  "/deleteTask/:deleteId",
  Authentication.authenticateToken,
  TaskController.deleteById
);
//upating ........
app.post(
  "/updateTask/:taskId",
  Authentication.authenticateToken,
  TaskController.PatchById
);

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
