import express from "express";
import bodyParser from "body-parser";
import { addPlayerToQueue, tryMatchmake } from "./matchmaking.js";
import { finalizeMatch, getMatch } from "./matches.js";

const app = express();
app.use(bodyParser.json());

// Player joins matchmaking queue
app.post("/matchmaking/join", async (req, res) => {
  const { playerId, rating } = req.body;
  if (!playerId) return res.status(400).json({ error: "Missing playerId" });

  addPlayerToQueue(playerId, rating || 1000);
  const match = await tryMatchmake();

  if (match) return res.json({ match });
  return res.json({ status: "waiting" });
});

// Explicitly finalize a match (called by Godot server or clients)
app.post("/match/finalize", (req, res) => {
  const { matchId } = req.body;
  if (!matchId) return res.status(400).json({ error: "Missing matchId" });

  const result = finalizeMatch(matchId);
  if (!result) return res.status(404).json({ error: "Match not found" });

  res.json({ status: "finalized", matchId });
});

// Fetch active match data
app.get("/match/:matchId", (req, res) => {
  const match = getMatch(req.params.matchId);
  if (!match) return res.status(404).json({ error: "Match not found" });
  res.json(match);
});

// New reconnect route — player checks if their match is still alive
app.post("/match/reconnect", (req, res) => {
  const { playerId, matchId } = req.body;
  if (!playerId || !matchId)
    return res.status(400).json({ error: "Missing playerId or matchId" });

  const match = getMatch(matchId);
  if (!match)
    return res.status(404).json({ error: "Match not found or expired" });

  // Verify player belongs to this match
  if (!match.players.includes(playerId))
    return res.status(403).json({ error: "Player not part of this match" });

  res.json({
    status: "active",
    matchId,
    port: match.port,
    players: match.players,
    since: new Date(match.createdAt).toISOString(),
  });
});

app.listen(3000, () => console.log("Matchmaker running on port 3000"));
