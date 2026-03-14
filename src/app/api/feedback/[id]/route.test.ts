import { describe, expect, it, vi, beforeEach } from 'vitest';

const createSupabaseServerClient = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient,
}));

describe('feedback detail route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 401 when deleting feedback without an authenticated user', async () => {
    createSupabaseServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: null },
        }),
      },
    });

    const { DELETE } = await import('./route');
    const response = await DELETE(new Request('http://localhost/api/feedback/test-id'), {
      params: Promise.resolve({ id: 'test-id' }),
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: 'Unauthorized',
    });
  });

  it('deletes an owned feedback record', async () => {
    const single = vi
      .fn()
      .mockResolvedValueOnce({
        data: { id: 'test-id' },
        error: null,
      });
    const eq = vi.fn(() => ({ single }));
    const select = vi.fn(() => ({ eq }));
    const deleteEq = vi.fn().mockResolvedValue({
      error: null,
    });
    const deleteFrom = vi.fn(() => ({
      eq: deleteEq,
    }));
    const from = vi.fn((table: string) => {
      if (table === 'speech_feedback') {
        return {
          select,
          delete: deleteFrom,
        };
      }

      throw new Error(`Unexpected table ${table}`);
    });

    createSupabaseServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'user-1' } },
        }),
      },
      from,
    });

    const { DELETE } = await import('./route');
    const response = await DELETE(new Request('http://localhost/api/feedback/test-id'), {
      params: Promise.resolve({ id: 'test-id' }),
    });

    expect(response.status).toBe(200);
    expect(from).toHaveBeenCalledWith('speech_feedback');
    expect(select).toHaveBeenCalledWith('id');
    expect(eq).toHaveBeenCalledWith('id', 'test-id');
    expect(deleteEq).toHaveBeenCalledWith('id', 'test-id');
    await expect(response.json()).resolves.toEqual({ success: true });
  });
});
