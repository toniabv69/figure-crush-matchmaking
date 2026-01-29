import express, { Router, Request, Response } from "express";
import { finalizeMatch, getMatch, findMatchByPlayer } from "../matches.js";

const router: Router = express.Router();

interface FinalizeRequest {
  matchId: string;
}

interface ReconnectRequest {
  playerId: string;
  matchId: string;
}

interface CheckRequest {
  playerId: string;
}

// Explicitly finalize a match (called by Godot server or clients)
router.post("/finalize", (req: Request<never, never, FinalizeRequest>, res: Response) => {
  const { matchId } = req.body;
  if (!matchId) return res.status(400).json({ error: "Missing matchId" });

  const result = finalizeMatch(matchId);
  if (!result) return res.status(404).json({ error: "Match not found" });

  res.json({ status: "finalized", matchId });
});

// Fetch active match data
router.get("/:matchId", (req: Request<{ matchId: string }>, res: Response) => {
  const match = getMatch(req.params.matchId);
  if (!match) return res.status(404).json({ error: "Match not found" });
  res.json(match);
});

// Reconnect route — player checks if their match is still alive
router.post("/reconnect", (req: Request<never, never, ReconnectRequest>, res: Response) => {
  const { playerId, matchId } = req.body;
  if (!playerId || !matchId)
    return res.status(400).json({ error: "Missing playerId or matchId" });

  const match = getMatch(matchId);
  if (!match)
    return res.status(404).json({ error: "Match not found or expired" });

  // Verify player belongs to this match
  if (!match.players.some(p => p.playerId === playerId))
    return res.status(403).json({ error: "Player not part of this match" });

  res.json({
    status: "active",
    matchId,
    port: match.port,
    players: match.players,
    since: new Date(match.createdAt).toISOString(),
  });
});

// Check whether a player is currently in any active match
router.post("/check", (req: Request<never, never, CheckRequest>, res: Response) => {
  const { playerId } = req.body;
  if (!playerId) return res.status(400).json({ error: "Missing playerId" });

  const found = findMatchByPlayer(playerId);
  if (!found) return res.json({ status: "none" });

  const { matchId, match } = found;
  return res.json({
    status: "active",
    matchId,
    port: match.port,
    players: match.players,
    since: new Date(match.createdAt).toISOString(),
  });
});

export default router;
