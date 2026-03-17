import { getAvailablePort } from "./portManager.js";
import { startGameInstance } from "./godotManager.js";
import { createMatch, finalizeMatch } from "./matches.js";

interface QueuedPlayer {
  playerId: string;
  username: string;
  rating: number;
  joinedAt: number;
}

interface MatchResult {
  matchId: string;
  port: number;
  players: { playerId: string; username: string }[];
}

let waitingPlayers: QueuedPlayer[] = [];

// Test helpers
export function resetQueue(): void {
  waitingPlayers = [];
}

export function getQueueLength(): number {
  return waitingPlayers.length;
}


export function addPlayerToQueue(playerId: string, username: string, rating: number): void {
  // Remove any existing player with the same playerId
  const existingIndex = waitingPlayers.findIndex(p => p.playerId === playerId);
  if (existingIndex !== -1) {
    const removed = waitingPlayers.splice(existingIndex, 1)[0];
    console.log(`[Queue] Duplicate playerId detected: ${playerId}. Removed old connection, new connection established.`);
  }

  waitingPlayers.push({ playerId, username, rating, joinedAt: Date.now() });
  console.log(`[Queue] Player ${username} (${playerId}) joined. Queue length: ${waitingPlayers.length}`);
}

export async function tryMatchmake(): Promise<MatchResult | null> {
  if (waitingPlayers.length < 2) return null;

  // Sort by rating for simplicity
  waitingPlayers.sort((a, b) => a.rating - b.rating);
  const [p1, p2] = waitingPlayers.splice(0, 2);

  const matchId = `${p1.playerId}_${p2.playerId}_${Date.now()}`;
  const port = getAvailablePort();

  const process = startGameInstance(matchId, port, [p1, p2], (id) => {
    finalizeMatch(id);
  });

  createMatch(matchId, [p1, p2], port, process);

  console.log(`[Matchmaker] Started match ${matchId} on port ${port}`);
  return { matchId, port, players: [{ playerId: p1.playerId, username: p1.username }, { playerId: p2.playerId, username: p2.username }] };
}
