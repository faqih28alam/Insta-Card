import cors, { CorsOptions } from "cors";

const corsOptions: CorsOptions = {
  origin: "http://localhost:4000",
  credentials: true,
  optionsSuccessStatus: 200,
};

export const allowCors = cors(corsOptions);
