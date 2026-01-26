import { getAvailablePort } from "./portManager.js";
import { startGameInstance } from "./godotManager.js";
import { createMatch, finalizeMatch } from "./matches.js";

interface QueuedPlayer {
  username: string;
  rating: number;
  joinedAt: number;
}

interface MatchResult {
  matchId: string;
  port: number;
  players: string[];
}

let waitingPlayers: QueuedPlayer[] = [];

export function addPlayerToQueue(username: string, rating: number): void {
  // Remove any existing player with the same username
  const existingIndex = waitingPlayers.findIndex(p => p.username === username);
  if (existingIndex !== -1) {
    const removed = waitingPlayers.splice(existingIndex, 1)[0];
    console.log(`[Queue] Duplicate username detected: ${username}. Removed old connection, new connection established.`);
  }

  waitingPlayers.push({ username, rating, joinedAt: Date.now() });
  console.log(`[Queue] Player ${username} joined. Queue length: ${waitingPlayers.length}`);
}

export async function tryMatchmake(): Promise<MatchResult | null> {
  if (waitingPlayers.length < 2) return null;

  // Sort by rating for simplicity
  waitingPlayers.sort((a, b) => a.rating - b.rating);
  const [p1, p2] = waitingPlayers.splice(0, 2);

  const matchId = `${p1.username}_${p2.username}_${Date.now()}`;
  const port = getAvailablePort();

  const process = startGameInstance(matchId, port, [p1.username, p2.username], (id) => {
    finalizeMatch(id);
  });

  createMatch(matchId, [p1.username, p2.username], port, process);

  console.log(`[Matchmaker] Started match ${matchId} on port ${port}`);
  return { matchId, port, players: [p1.username, p2.username] };
}
