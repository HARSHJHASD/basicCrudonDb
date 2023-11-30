const { default: mongoose } = require("mongoose");

const Task = mongoose.model("Task", {
  taskName: String,
  description: String,
  dueDate: Date,
  status: String,
});

module.exports = Task;
