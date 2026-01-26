interface Player {
  username: string;
  rating: number;
  joinedAt: number;
}

const waitingPlayers: Player[] = [];

// Add player to queue
export function enqueuePlayer(player: Player): void {
  waitingPlayers.push({
    ...player,
    joinedAt: Date.now()
  });
}

// Remove player by username
export function removePlayer(username: string): void {
  const index = waitingPlayers.findIndex(p => p.username === username);
  if (index !== -1) waitingPlayers.splice(index, 1);
}

// Find best match for a player
export function findBestMatch(): Player[] | null {
  if (waitingPlayers.length < 2) return null;

  // Sort by who's been waiting longest
  waitingPlayers.sort((a, b) => a.joinedAt - b.joinedAt);
  const playerA = waitingPlayers[0];

  // Find closest rating
  let closest: Player | null = null;
  let smallestDiff = Infinity;
  for (let i = 1; i < waitingPlayers.length; i++) {
    const diff = Math.abs(waitingPlayers[i].rating - playerA.rating);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closest = waitingPlayers[i];
    }
  }

  if (!closest) return null;

  // Remove matched players from queue
  removePlayer(playerA.username);
  removePlayer(closest.username);

  return [playerA, closest];
}
