const waitingPlayers = [];

// Add player to queue
export function enqueuePlayer(player) {
  waitingPlayers.push({
    ...player,
    joinedAt: Date.now()
  });
}

// Remove player by ID
export function removePlayer(playerId) {
  const index = waitingPlayers.findIndex(p => p.id === playerId);
  if (index !== -1) waitingPlayers.splice(index, 1);
}

// Find best match for a player
export function findBestMatch() {
  if (waitingPlayers.length < 2) return null;

  // Sort by who’s been waiting longest
  waitingPlayers.sort((a, b) => a.joinedAt - b.joinedAt);
  const playerA = waitingPlayers[0];

  // Find closest rating
  let closest = null;
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
  removePlayer(playerA.id);
  removePlayer(closest.id);

  return [playerA, closest];
}