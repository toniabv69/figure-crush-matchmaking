import { GAME_PORT_RANGE } from "./gameConfig.js";

const activePorts = new Set();

export function getAvailablePort() {
  for (let port = GAME_PORT_RANGE.start; port <= GAME_PORT_RANGE.end; port++) {
    if (!activePorts.has(port)) {
      activePorts.add(port);
      return port;
    }
  }
  throw new Error("No available ports left in range.");
}

export function releasePort(port) {
  activePorts.delete(port);
  console.log(`[Port Manager] Released port ${port}`);
}
