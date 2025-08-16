import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import usersRouter from "./routes/users.routes";
import cardsRouter from "./routes/cards.routes";
import { connectDB } from "./DB/moongo.init";
import { requestLogger } from "./utils/request_logger";

dotenv.config();

const PORT = process.env.PORT || 3000;
connectDB();
const app = express();

/** Middlewares */
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(requestLogger)

/** Routes */
app.use("/api/users", usersRouter);
app.use("/api/cards", cardsRouter);

/** Health check */
app.get("/health", (_req, res) => {
    console.log("HEALTH");

    res.json({ status: "OK" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});