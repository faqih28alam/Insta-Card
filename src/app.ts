import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { allowCors } from "./middlewares/cors";
import { errorHandler } from "./middlewares/error";

// Routes
import authRouter from "./routes/auth";
import userRouter from "./routes/user";
import linkRouter from "./routes/link";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(allowCors);
app.use(cookieParser());
app.use(express.json());

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1", linkRouter);

// Testing express
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
