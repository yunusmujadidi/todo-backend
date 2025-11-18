const express = require("express");
const { body } = require("express-validator");
const { register, login, getMe } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// register validation
const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Nama tidak boleh kosong")
    .isLength({ min: 2, max: 100 })
    .withMessage("Nama harus 2-100 karakter"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email tidak boleh kosong")
    .isEmail()
    .withMessage("Isi dengan email yang valid")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password tidak boleh kosong")
    .isLength({ min: 6 })
    .withMessage("Password minimal 6 karakter"),
];

// login validation
const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email tidak boleh kosong")
    .isEmail()
    .withMessage("Isi dengan email yang valid")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password tidak boleh kosong"),
];

// routes
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.get("/me", protect, getMe);

module.exports = router;
