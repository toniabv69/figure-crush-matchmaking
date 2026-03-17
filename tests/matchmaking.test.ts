import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../src/portManager.js', () => ({
  getAvailablePort: vi.fn(() => 7000),
}));

vi.mock('../src/godotManager.js', () => ({
  startGameInstance: vi.fn((matchId: string, port: number, players: any[], onExit: (id: string) => void) => {
    // Simulate match exit immediately
    onExit(matchId);
    return { pid: 123 } as unknown as any;
  }),
}));

vi.mock('../src/matches.js', () => ({
  createMatch: vi.fn(),
  finalizeMatch: vi.fn(() => true),
}));

import { addPlayerToQueue, tryMatchmake, resetQueue, getQueueLength } from '../src/matchmaking.js';
import { startGameInstance } from '../src/godotManager.js';
import { createMatch } from '../src/matches.js';

describe('matchmaking', () => {
  beforeEach(() => {
    resetQueue();
    vi.clearAllMocks();
    vi.useFakeTimers().setSystemTime(new Date('2026-03-17T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('queues players and starts a match when enough players are available', async () => {
    addPlayerToQueue('p1', 'alice', 1000);
    addPlayerToQueue('p2', 'bob', 1020);

    const result = await tryMatchmake();
    expect(result).not.toBeNull();
    expect(result?.port).toBe(7000);
    expect(result?.players.map(p => p.playerId).sort()).toEqual(['p1', 'p2']);

    expect(startGameInstance).toHaveBeenCalledTimes(1);
    expect(createMatch).toHaveBeenCalledTimes(1);

    // Queue should be empty after match starts
    expect(getQueueLength()).toBe(0);
  });

  it('does not create a match with fewer than 2 players', async () => {
    addPlayerToQueue('p1', 'alice', 1000);
    const result = await tryMatchmake();
    expect(result).toBeNull();
    expect(getQueueLength()).toBe(1);
  });

  it('replaces duplicate playerId in queue', () => {
    addPlayerToQueue('p1', 'alice', 1000);
    addPlayerToQueue('p1', 'alice2', 1000);

    // still only one player in queue
    expect(getQueueLength()).toBe(1);
  });
});
