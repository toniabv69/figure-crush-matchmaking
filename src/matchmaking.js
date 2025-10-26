import { getAvailablePort } from "./portManager.js";
import { startGameInstance } from "./godotManager.js";
import { createMatch, finalizeMatch } from "./matches.js";

let waitingPlayers = [];

export function addPlayerToQueue(playerId, rating) {
  waitingPlayers.push({ playerId, rating, joinedAt: Date.now() });
  console.log(`[Queue] Player ${playerId} joined. Queue length: ${waitingPlayers.length}`);
}

export async function tryMatchmake() {
  if (waitingPlayers.length < 2) return null;

  // Sort by rating for simplicity
  waitingPlayers.sort((a, b) => a.rating - b.rating);
  const [p1, p2] = waitingPlayers.splice(0, 2);

  const matchId = `${p1.playerId}_${p2.playerId}_${Date.now()}`;
  const port = getAvailablePort();

  const process = startGameInstance(matchId, port, [p1.playerId, p2.playerId], (id) => {
    finalizeMatch(id);
  });

  createMatch(matchId, [p1.playerId, p2.playerId], port, process);

  console.log(`[Matchmaker] Started match ${matchId} on port ${port}`);
  return { matchId, port, players: [p1.playerId, p2.playerId] };
}
