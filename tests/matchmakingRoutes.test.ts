import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../src/server.ts';

vi.mock('../src/matchmaking.js');
import { addPlayerToQueue, tryMatchmake } from '../src/matchmaking.js';

describe('matchmaking routes', () => {
  it('POST /matchmaking/join - success waiting', async () => {
    const mockAdd = vi.mocked(addPlayerToQueue);
    const mockTry = vi.mocked(tryMatchmake);
    mockTry.mockResolvedValue(null);

    const res = await request(app)
      .post('/matchmaking/join')
      .send({ playerId: 'p1', username: 'alice' })
      .expect(200);

    expect(res.body).toEqual({ status: 'waiting' });
    expect(mockAdd).toHaveBeenCalledWith('p1', 'alice', 1000);
    expect(mockTry).toHaveBeenCalled();
  });

  it('POST /matchmaking/join - match found', async () => {
    const mockAdd = vi.mocked(addPlayerToQueue);
    const mockTry = vi.mocked(tryMatchmake);
    const mockMatch = { id: 'match1', port: 7000, players: [], createdAt: Date.now() };
    mockTry.mockResolvedValue(mockMatch);

    const res = await request(app)
      .post('/matchmaking/join')
      .send({ playerId: 'p1', username: 'alice', rating: 1200 })
      .expect(202);

    expect(res.body).toEqual({ match: mockMatch });
    expect(mockAdd).toHaveBeenCalledWith('p1', 'alice', 1200);
    expect(mockTry).toHaveBeenCalled();
  });

  it('POST /matchmaking/join - missing playerId', async () => {
    const res = await request(app)
      .post('/matchmaking/join')
      .send({ username: 'alice' })
      .expect(400);

    expect(res.body).toEqual({ error: 'Missing playerId' });
  });

  it('POST /matchmaking/join - missing username', async () => {
    const res = await request(app)
      .post('/matchmaking/join')
      .send({ playerId: 'p1' })
      .expect(400);

    expect(res.body).toEqual({ error: 'Missing username' });
  });
});