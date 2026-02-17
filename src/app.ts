import express from "express";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger/index";

import { allowCors } from "./middlewares/cors";
import { errorHandler } from "./middlewares/error";

// Routes
import authRouter from "./routes/auth";
import profileRouter from "./routes/profile";
import linkRouter from "./routes/link";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(allowCors);
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/profile", profileRouter);
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
