import { ChildProcess } from "child_process";

interface Match {
  players: string[];
  port: number;
  process?: ChildProcess;
  createdAt: number;
}

const matches = new Map<string, Match>();

export function createMatch(
  matchId: string,
  players: string[],
  port: number,
  process: ChildProcess
): void {
  matches.set(matchId, { players, port, process, createdAt: Date.now() });
}

export function finalizeMatch(matchId: string): boolean {
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

export function getMatch(matchId: string): Match | undefined {
  return matches.get(matchId);
}

export function findMatchByPlayer(username: string): { matchId: string; match: Match } | null {
  for (const [id, match] of matches.entries()) {
    if (Array.isArray(match.players) && match.players.includes(username)) {
      return { matchId: id, match };
    }
  }
  return null;
}
