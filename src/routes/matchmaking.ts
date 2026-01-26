import express, { Router, Request, Response } from "express";
import { addPlayerToQueue, tryMatchmake } from "../matchmaking.js";

const router: Router = express.Router();

interface JoinRequest {
  username: string;
  rating?: number;
}

// Player joins matchmaking queue
router.post("/join", async (req: Request<never, never, JoinRequest>, res: Response) => {
  const { username, rating } = req.body;
  if (!username) return res.status(400).json({ error: "Missing username" });

  addPlayerToQueue(username, rating || 1000);
  const match = await tryMatchmake();

  if (match) return res.status(202).json({ match });
  return res.status(200).json({ status: "waiting" });
});

export default router;
