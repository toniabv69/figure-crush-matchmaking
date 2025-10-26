import { spawn } from "child_process";
import { releasePort } from "./portManager.js";
import { GAME_BINARY_PATH } from "./gameConfig.js";

export function startGameInstance(matchId, port, players, onExit) {
  console.log(`[Match ${matchId}] Starting Godot server on port ${port}`);

  const args = [
    "--headless",
    `--port=${port}`,
    `--match_id=${matchId}`,
    `--players=${players.join(",")}`,
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
