import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { buildAnalysisPrompt } from '@/lib/constants/prompts';
import { SpeechAnalysis } from '@/lib/types';

const execAsync = promisify(exec);

// Timeout for codex command (60 seconds)
const CODEX_TIMEOUT = 60000;

interface AnalyzeRequest {
  transcript: string;
  topic: string;
  framework: string;
}

function parseAnalysisResponse(output: string): SpeechAnalysis {
  // Try to extract JSON from the output
  // The output might contain additional text before/after the JSON

  // First, try to find JSON object in the output
  const jsonMatch = output.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]);

    // Validate the structure
    const analysis: SpeechAnalysis = {
      clarityAndStructure: {
        score: Number(parsed.clarityAndStructure?.score) || 5,
        feedback: String(parsed.clarityAndStructure?.feedback || 'No feedback provided'),
      },
      concisenessAndWordChoice: {
        score: Number(parsed.concisenessAndWordChoice?.score) || 5,
        feedback: String(parsed.concisenessAndWordChoice?.feedback || 'No feedback provided'),
      },
      emotionalResonance: {
        score: Number(parsed.emotionalResonance?.score) || 5,
        feedback: String(parsed.emotionalResonance?.feedback || 'No feedback provided'),
      },
      toneAndPresence: {
        score: Number(parsed.toneAndPresence?.score) || 5,
        feedback: String(parsed.toneAndPresence?.feedback || 'No feedback provided'),
      },
      audienceConnection: {
        score: Number(parsed.audienceConnection?.score) || 5,
        feedback: String(parsed.audienceConnection?.feedback || 'No feedback provided'),
      },
      improvements: Array.isArray(parsed.improvements)
        ? parsed.improvements.map(String)
        : ['Work on clarity', 'Practice more', 'Be more concise'],
      overallScore: Number(parsed.overallScore) || 5,
    };

    return analysis;
  } catch (e) {
    throw new Error(`Failed to parse JSON: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
}

export async function POST(request: Request) {
  try {
    const body: AnalyzeRequest = await request.json();
    const { transcript, topic, framework } = body;

    if (!transcript || !topic || !framework) {
      return NextResponse.json(
        { error: 'Missing required fields: transcript, topic, framework' },
        { status: 400 }
      );
    }

    // Build the prompt
    const prompt = buildAnalysisPrompt(transcript, topic, framework);

    // Escape the prompt for shell
    // We'll write it to a temp file to avoid shell escaping issues
    const fs = await import('fs/promises');
    const os = await import('os');
    const path = await import('path');

    const tempDir = os.tmpdir();
    const promptFile = path.join(tempDir, `codex-prompt-${Date.now()}.txt`);

    await fs.writeFile(promptFile, prompt, 'utf-8');

    try {
      // Run codex exec with the prompt file
      const { stdout, stderr } = await execAsync(
        `codex exec "$(cat '${promptFile}')"`,
        {
          timeout: CODEX_TIMEOUT,
          maxBuffer: 1024 * 1024 * 10, // 10MB buffer
          shell: '/bin/bash',
        }
      );

      // Clean up temp file
      await fs.unlink(promptFile).catch(() => {});

      if (stderr && !stdout) {
        console.error('Codex stderr:', stderr);
        return NextResponse.json(
          { error: `Codex error: ${stderr}` },
          { status: 500 }
        );
      }

      // Parse the response
      const analysis = parseAnalysisResponse(stdout);

      return NextResponse.json({ analysis });
    } catch (execError: any) {
      // Clean up temp file on error
      await fs.unlink(promptFile).catch(() => {});

      if (execError.code === 'ENOENT') {
        return NextResponse.json(
          {
            error: 'Codex CLI not found. Please ensure Codex is installed and available in your PATH.',
            code: 'CODEX_NOT_FOUND',
          },
          { status: 500 }
        );
      }

      if (execError.killed) {
        return NextResponse.json(
          {
            error: 'Analysis timed out. The transcript may be too long.',
            code: 'TIMEOUT',
          },
          { status: 504 }
        );
      }

      throw execError;
    }
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Analysis failed',
        code: 'ANALYSIS_FAILED',
      },
      { status: 500 }
    );
  }
}
