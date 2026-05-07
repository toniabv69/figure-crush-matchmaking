import { ChildProcess } from "child_process";

interface Player {
  playerId: string;
  username: string;
}

interface Match {
  players: Player[];
  port: number;
  process?: ChildProcess;
  createdAt: number;
}

const matches = new Map<string, Match>();

export function createMatch(
  matchId: string,
  players: Player[],
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
  asd
  matches.delete(matchId);
  return true;
}

export function getMatch(matchId: string): Match | undefined {
  return matches.get(matchId);
}

export function findMatchByPlayer(playerId: string): { matchId: string; match: Match } | null {
  for (const [id, match] of matches.entries()) {
    if (Array.isArray(match.players) && match.players.some(p => p.playerId === playerId)) {
      return { matchId: id, match };
    }
  }
  return null;
}
