import { describe, it, expect, vi } from 'vitest';
import { createMatch, finalizeMatch, getMatch, findMatchByPlayer } from '../src/matches.js';

vi.mock('child_process', () => ({
  ChildProcess: class {},
}));

describe('matches', () => {
  it('creates and retrieves a match', () => {
    const mockProcess = { pid: 123 } as any;
    createMatch('match1', [{ playerId: 'p1', username: 'alice' }], 7000, mockProcess);

    const match = getMatch('match1');
    expect(match).not.toBeUndefined();
    expect(match?.players[0].playerId).toBe('p1');
    expect(match?.port).toBe(7000);
  });

  it('finalizes a match and removes it', () => {
    const mockProcess = { kill: vi.fn() } as any;
    createMatch('match2', [{ playerId: 'p1', username: 'alice' }], 7000, mockProcess);

    const result = finalizeMatch('match2');
    expect(result).toBe(true);
    expect(mockProcess.kill).toHaveBeenCalledWith('SIGTERM');

    const match = getMatch('match2');
    expect(match).toBeUndefined();
  });

  it('finds match by player', () => {
    createMatch('match3', [{ playerId: 'p3', username: 'charlie' }, { playerId: 'p4', username: 'diana' }], 7001, {} as any);

    const found = findMatchByPlayer('p3');
    expect(found).not.toBeNull();
    expect(found?.matchId).toBe('match3');
  });
});
