const matches = new Map();

export function createMatch(matchId, players, port, process) {
  matches.set(matchId, { players, port, process, createdAt: Date.now() });
}

export function finalizeMatch(matchId) {
  const match = matches.get(matchId);
  if (!match) return false;

  if (match.process) {
    try {
      match.process.kill("SIGTERM");
      console.log(`[Match ${matchId}] Terminated process.`);
    } catch (err) {
      console.error(`[Match ${matchId}] Error terminating process:`, err);
    }
  }

  matches.delete(matchId);
  return true;
}

export function getMatch(matchId) {
  return matches.get(matchId);
}
