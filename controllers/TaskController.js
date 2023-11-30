const { default: mongoose } = require("mongoose");
const Task = require("../models/Task");

async function TaskGet(req, res) {
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
}

async function fetchByIdasync(req, res, next) {
  const id = req.params.TaskId;
  try {
    const response = await Task.findById(id);
    res.json({ task: response });
  } catch (error) {
    res.send(error);
  }
}

async function addTask(req, res, next) {
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
}

async function deleteById(req, res, next) {
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

async function PatchById(req, res, next) {
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
}

module.exports = {
  TaskGet,
  fetchByIdasync,
  addTask,
  deleteById,
  PatchById,
  // Add other controller functions as needed
};
