const DEFAULT_DAILY_ANALYSIS_LIMIT = 3;
const DEFAULT_MAX_TRANSCRIPT_CHARS = 12000;
const DEFAULT_DAILY_ANALYSIS_LIMIT_OVERRIDES: Record<string, number> = {
  'metygl@gmail.com': 50,
};

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function parseDailyAnalysisLimitOverrides(value: string | undefined) {
  const overrides = { ...DEFAULT_DAILY_ANALYSIS_LIMIT_OVERRIDES };

  if (!value) {
    return overrides;
  }

  for (const entry of value.split(',')) {
    const [rawEmail, rawLimit] = entry.split(':');
    const email = normalizeEmail(rawEmail ?? '');
    const limit = Number.parseInt(rawLimit ?? '', 10);

    if (!email || !Number.isFinite(limit) || limit <= 0) {
      continue;
    }

    overrides[email] = limit;
  }

  return overrides;
}

export function getDailyAnalysisLimitForEmail(
  email: string | null | undefined,
  fallbackLimit: number,
  overrides: Record<string, number>
) {
  if (!email) {
    return fallbackLimit;
  }

  return overrides[normalizeEmail(email)] ?? fallbackLimit;
}

export function getSupabasePublicEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey),
  };
}

export function getAuthRedirectUrl(): string | null {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    return `${appUrl.replace(/\/$/, '')}/auth/callback`;
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/auth/callback`;
  }

  return null;
}

export function getServerRuntimeConfig() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    openAiApiKey: process.env.OPENAI_API_KEY ?? '',
    evalModel: process.env.OPENAI_EVAL_MODEL ?? '',
    dailyAnalysisLimit: parsePositiveInteger(
      process.env.DAILY_ANALYSIS_LIMIT,
      DEFAULT_DAILY_ANALYSIS_LIMIT
    ),
    dailyAnalysisLimitOverrides: parseDailyAnalysisLimitOverrides(
      process.env.DAILY_ANALYSIS_LIMIT_OVERRIDES
    ),
    maxTranscriptChars: parsePositiveInteger(
      process.env.MAX_TRANSCRIPT_CHARS,
      DEFAULT_MAX_TRANSCRIPT_CHARS
    ),
  };
}

export function assertSupabaseServerConfig() {
  const config = getServerRuntimeConfig();

  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    );
  }

  return config;
}

export function assertServerRuntimeConfig() {
  const config = assertSupabaseServerConfig();

  if (!config.openAiApiKey) {
    throw new Error('OpenAI is not configured. Set OPENAI_API_KEY.');
  }

  if (!config.evalModel) {
    throw new Error('OpenAI evaluation model is not configured. Set OPENAI_EVAL_MODEL.');
  }

  return config;
}
