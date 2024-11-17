import dotenv from "dotenv";
import express from "express";
import { router } from "./routes/v1";
dotenv.config();

const PORT = process.env.PORT || 8080;
console.log("port is: ", PORT);
const app = express();
app.use(express.json());

app.use("/api/v1", router);

app.listen(PORT, () => {
	console.log(`running on port http://localhost:${PORT}`);
});
