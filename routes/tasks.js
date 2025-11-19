const express = require("express");
const { body } = require("express-validator");
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// task create validation
const createTaskValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Judul wajib diisi")
    .isLength({ min: 3, max: 255 })
    .withMessage("Judul minimal 3 karakter"),
  body("description").optional().trim(),
  body("status")
    .optional()
    .isIn(["pending", "in-progress", "done"])
    .withMessage("Status harus pending, in-progress, atau done"),
];

// Validation rules untuk update task
const updateTaskValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 255 })
    .withMessage("Judul minimal 3-255 karakter"),
  body("description").optional().trim(),
  body("status")
    .optional()
    .isIn(["pending", "in-progress", "done"])
    .withMessage("Status harus pending, in-progress, atau done"),
];

// protected routes using middleware
router.use(protect);

// routes
router
  .route("/")
  .get(getTasks) // GET /api/tasks
  .post(createTaskValidation, createTask); // POST /api/tasks

router
  .route("/:id")
  .get(getTask) // GET /api/tasks/:id
  .put(updateTaskValidation, updateTask) // PUT /api/tasks/:id
  .delete(deleteTask); // DELETE /api/tasks/:id

module.exports = router;
