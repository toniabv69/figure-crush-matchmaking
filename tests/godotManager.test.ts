import { describe, it, expect, vi } from 'vitest';
import { startGameInstance } from '../src/godotManager.js';
import { GAME_BINARY_PATH } from '../src/gameConfig.js';
import { spawn } from 'child_process';

vi.mock('child_process', () => ({
  spawn: vi.fn(() => ({
    on: vi.fn(),
  })),
}));

describe('godotManager', () => {
  it('starts a game instance with correct args', () => {
    const players = [{ playerId: 'p1', username: 'alice' }, { playerId: 'p2', username: 'bob' }];

    startGameInstance('match1', 7000, players);

    expect(spawn).toHaveBeenCalledWith(GAME_BINARY_PATH, [
      '--headless',
      '--port=7000',
      '--match_id=match1',
      '--player_ids=p1,p2',
      '--usernames=alice,bob',
    ], { stdio: 'inherit' });
  });
});
