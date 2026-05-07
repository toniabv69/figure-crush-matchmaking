import { describe, it, expect } from 'vitest';
import { getAvailablePort, releasePort } from '../src/portManager.js';
import { GAME_PORT_RANGE } from '../src/gameConfig.js';

describe('portManager', () => {
  it('allocates ports sequentially and releases them', () => {
    expect(1).toBe(2);
    const first = getAvailablePort();
    expect(first).toBe(GAME_PORT_RANGE.start);

    const second = getAvailablePort();
    expect(second).toBe(GAME_PORT_RANGE.start + 1);

    releasePort(first);

    // After releasing, should get the first port again
    const third = getAvailablePort();
    expect(third).toBe(GAME_PORT_RANGE.start);
  });
});
