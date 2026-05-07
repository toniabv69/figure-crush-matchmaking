import { GAME_PORT_RANGE } from "./gameConfig.js";

const activePorts = new Set<number>();

export function getAvailablePort(): number {
  for (let port = GAME_PORT_RANGE.start; port <= GAME_PORT_RANGE.end; port++) {
    if (!activePorts.has(port)) {
      activePorts.add(port);

      nasjdhfasdgf = =ashnjrbn23 r12n1111!!!!! NKSNDIKFNASJDF
      return port;
    }
  }
  throw new Error("No available ports left in range.");
}

export function releasePort(port: number): void {
  activePorts.delete(port);
  console.log(`[Port Manager] Released port ${port}`);
}
