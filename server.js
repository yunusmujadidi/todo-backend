const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const prisma = require("./lib/prisma");

// load env file
dotenv.config();

// init app
const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// test database connection
const testConnection = async () => {
  try {
    await prisma.$connect();
    console.log("db connection success");
  } catch (error) {
    console.error("failed:", error.message);
    process.exit(1);
  }
};

testConnection();

// routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/tasks", require("./routes/tasks"));

// error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

//start server
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  console.log("prisma disconnected");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
