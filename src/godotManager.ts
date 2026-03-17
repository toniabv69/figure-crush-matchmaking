import { spawn, ChildProcess } from "child_process";
import { releasePort } from "./portManager.js";
import { GAME_BINARY_PATH } from "./gameConfig.js";

// This is a comment.

interface MatchPlayer {
  playerId: string;
  username: string;
}

export function startGameInstance(
  matchId: string,
  port: number,
  players: MatchPlayer[],
  onExit?: (id: string) => void
): ChildProcess {
  console.log(`[Match ${matchId}] Starting Godot server on port ${port}`);

  const playerIds = players.map(p => p.playerId).join(",");
  const usernames = players.map(p => p.username).join(",");

  const args = [
    "--headless",
    `--port=${port}`,
    `--match_id=${matchId}`,
    `--player_ids=${playerIds}`,
    `--usernames=${usernames}`,
  ];

  const proc = spawn(GAME_BINARY_PATH, args, { stdio: "inherit" });

  proc.on("exit", (code, signal) => {
    console.log(`[Match ${matchId}] Process exited (code=${code}, signal=${signal})`);
    releasePort(port);
    onExit?.(matchId);
  });

  proc.on("error", (err) => {
    console.error(`[Match ${matchId}] Failed to start process:`, err);
    releasePort(port);
    onExit?.(matchId);
  });

  return proc;
}
