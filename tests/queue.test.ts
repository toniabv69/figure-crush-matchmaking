import { describe, it, expect } from 'vitest';
import { describe, it, expect, beforeEach } from 'vitest';
import { enqueuePlayer, findBestMatch, removePlayer, resetQueue } from '../src/queue.js';

describe('queue', () => {
  beforeEach(() => {
    resetQueue();
  });

  it('finds best match and removes matched players', () => {
    enqueuePlayer({ username: 'alice', rating: 1200, joinedAt: 0 });
    enqueuePlayer({ username: 'bob', rating: 1220, joinedAt: 0 });

    const match = findBestMatch();
    expect(match).not.toBeNull();
    expect(match).toHaveLength(2);
    expect(match.map(p => p.username).sort()).toEqual(['alice', 'bob']);

    // The queue should now be empty
    expect(findBestMatch()).toBeNull();
  });

  it('removes player by username', () => {
    enqueuePlayer({ username: 'charlie', rating: 1300, joinedAt: 0 });
    removePlayer('charlie');
    expect(findBestMatch()).toBeNull();
  });
});
