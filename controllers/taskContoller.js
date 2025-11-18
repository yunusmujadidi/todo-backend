const { validationResult } = require("express-validator");
const prisma = require("../lib/prisma");

// @desc    create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    // validasi input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { title, description, status } = req.body;
    const userId = req.user.id;

    // create new task
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || "pending",
        userId,
      },
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: { task },
    });
  } catch (error) {
    console.error("Create Task Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    get all user task
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;

    // filter status
    const where = { userId };
    if (status) {
      where.status = status;
    }

    // get all tasks
    const tasks = await prisma.task.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      count: tasks.length,
      stats: formattedStats,
      data: { tasks },
    });
  } catch (error) {
    console.error("Get Tasks Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = req.user.id;

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // only user login task
    if (task.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this task",
      });
    }

    res.status(200).json({
      success: true,
      data: { task },
    });
  } catch (error) {
    console.error("Get Task Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    // validasi input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const taskId = parseInt(req.params.id);
    const userId = req.user.id;
    const { title, description, status } = req.body;

    // check user & task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // only user login task
    if (existingTask.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this task",
      });
    }

    // update task
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(status !== undefined && { status }),
      },
    });

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: { task: updatedTask },
    });
  } catch (error) {
    console.error("Update Task Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const taskId = parseInt(req.params.id);
    const userId = req.user.id;

    // check user & task exists
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // only user login task
    if (existingTask.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this task",
      });
    }

    // delete task
    await prisma.task.delete({
      where: { id: taskId },
    });

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete Task Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
};
