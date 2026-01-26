import express from "express";
import bodyParser from "body-parser";
import matchmakingRoutes from "./routes/matchmaking.js";
import matchRoutes from "./routes/match.js";

const app = express();
app.use(bodyParser.json());

app.use("/matchmaking", matchmakingRoutes);
app.use("/match", matchRoutes);

app.listen(3000, () => console.log("Matchmaker running on port 3000"));
