import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { app } from '../src/server.js';

vi.mock('../src/matches.js');
import { finalizeMatch, getMatch, findMatchByPlayer } from '../src/matches.js';

describe('match routes', () => {
  it('POST /match/finalize - success', async () => {
    const mockFinalize = vi.mocked(finalizeMatch);
    mockFinalize.mockReturnValue(true);

    const res = await request(app)
      .post('/match/finalize')
      .send({ matchId: 'match1' })
      .expect(200);

    expect(res.body).toEqual({ status: 'finalized', matchId: 'match1' });
    expect(mockFinalize).toHaveBeenCalledWith('match1');
  });

  it('POST /match/finalize - not found', async () => {
    const mockFinalize = vi.mocked(finalizeMatch);
    mockFinalize.mockReturnValue(false);

    const res = await request(app)
      .post('/match/finalize')
      .send({ matchId: 'match1' })
      .expect(404);

    expect(res.body).toEqual({ error: 'Match not found' });
  });

  it('POST /match/finalize - missing matchId', async () => {
    const res = await request(app)
      .post('/match/finalize')
      .send({})
      .expect(400);

    expect(res.body).toEqual({ error: 'Missing matchId' });
  });

  it('GET /match/:matchId - found', async () => {
    const mockGet = vi.mocked(getMatch);
    const mockMatch = { id: 'match1', port: 7000, players: [], createdAt: Date.now() };
    mockGet.mockReturnValue(mockMatch);

    const res = await request(app)
      .get('/match/match1')
      .expect(200);

    expect(res.body).toEqual(mockMatch);
  });

  it('GET /match/:matchId - not found', async () => {
    const mockGet = vi.mocked(getMatch);
    mockGet.mockReturnValue(null);

    const res = await request(app)
      .get('/match/match1')
      .expect(404);

    expect(res.body).toEqual({ error: 'Match not found' });
  });

  it('POST /match/reconnect - success', async () => {
    const mockGet = vi.mocked(getMatch);
    const mockMatch = {
      id: 'match1',
      port: 7000,
      players: [{ playerId: 'p1', username: 'alice' }],
      createdAt: Date.now()
    };
    mockGet.mockReturnValue(mockMatch);

    const res = await request(app)
      .post('/match/reconnect')
      .send({ playerId: 'p1', matchId: 'match1' })
      .expect(200);

    expect(res.body.status).toBe('active');
    expect(res.body.matchId).toBe('match1');
  });

  it('POST /match/reconnect - missing params', async () => {
    const res = await request(app)
      .post('/match/reconnect')
      .send({ playerId: 'p1' })
      .expect(400);

    expect(res.body).toEqual({ error: 'Missing playerId or matchId' });
  });

  it('POST /match/reconnect - match not found', async () => {
    const mockGet = vi.mocked(getMatch);
    mockGet.mockReturnValue(null);

    const res = await request(app)
      .post('/match/reconnect')
      .send({ playerId: 'p1', matchId: 'match1' })
      .expect(404);

    expect(res.body).toEqual({ error: 'Match not found or expired' });
  });

  it('POST /match/reconnect - player not in match', async () => {
    const mockGet = vi.mocked(getMatch);
    const mockMatch = {
      id: 'match1',
      port: 7000,
      players: [{ playerId: 'p2', username: 'bob' }],
      createdAt: Date.now()
    };
    mockGet.mockReturnValue(mockMatch);

    const res = await request(app)
      .post('/match/reconnect')
      .send({ playerId: 'p1', matchId: 'match1' })
      .expect(403);

    expect(res.body).toEqual({ error: 'Player not part of this match' });
  });

  it('POST /match/check - in match', async () => {
    const mockFind = vi.mocked(findMatchByPlayer);
    const mockMatch = {
      id: 'match1',
      port: 7000,
      players: [{ playerId: 'p1', username: 'alice' }],
      createdAt: Date.now()
    };
    mockFind.mockReturnValue({ matchId: 'match1', match: mockMatch });

    const res = await request(app)
      .post('/match/check')
      .send({ playerId: 'p1' })
      .expect(200);

    expect(res.body.status).toBe('active');
    expect(res.body.matchId).toBe('match1');
  });

  it('POST /match/check - not in match', async () => {
    const mockFind = vi.mocked(findMatchByPlayer);
    mockFind.mockReturnValue(null);

    const res = await request(app)
      .post('/match/check')
      .send({ playerId: 'p1' })
      .expect(200);

    expect(res.body).toEqual({ status: 'none' });
  });

  it('POST /match/check - missing playerId', async () => {
    const res = await request(app)
      .post('/match/check')
      .send({})
      .expect(400);

    expect(res.body).toEqual({ error: 'Missing playerId' });
  });
});