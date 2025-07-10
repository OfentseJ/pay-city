import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./data/database.js";
import userRoutes from "./routes/users.js";

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "pay city backend", endpoints: { users: "/api/users" } });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
