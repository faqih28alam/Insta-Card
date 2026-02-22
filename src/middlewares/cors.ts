import cors, { CorsOptions } from "cors";

const corsOptions: CorsOptions = {
  origin: ["http://localhost:4000", "https://link-hub-card.vercel.app"],
  credentials: true,
  optionsSuccessStatus: 200,
};

export const allowCors = cors(corsOptions);
