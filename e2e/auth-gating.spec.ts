import { expect, test } from '@playwright/test';

test.describe('Auth gating', () => {
  test('home page shows the guest sign-in CTA', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Impromptu' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign In for AI' })).toBeVisible();
  });

  test('login page is Google-only for the demo rollout', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Sign in for AI feedback' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
    await expect(
      page.getByText('Google sign-in is the only enabled login method for this demo.')
    ).toBeVisible();
    await expect(page.getByLabel('Email magic link')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Send magic link' })).toHaveCount(0);
  });

  test('practice page keeps AI analysis locked for guests', async ({ page }) => {
    await page.goto('/practice');

    await expect(page.getByText('AI feedback is sign-in only')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign in to enable feedback' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Transcribe & Analyze' })).toHaveCount(0);
  });

  test('feedback page prompts guests to sign in', async ({ page }) => {
    await page.goto('/feedback');

    await expect(page.getByRole('heading', { name: 'Sign in to keep feedback' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  });

  test('an anonymous analyze request returns 401', async ({ request }) => {
    const response = await request.post('/api/analyze', {
      data: {
        transcript: 'A short transcript for auth coverage.',
        topic: 'Testing auth gates',
        framework: 'PREP',
        frameworkId: 'prep',
      },
    });

    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: 'You must be signed in to analyze a speech.',
    });
  });
});
