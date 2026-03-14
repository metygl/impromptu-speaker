import { SpeechAnalysis, SpeechFeedbackRecord } from '@/lib/types';

export const ANALYSIS_PROMPT_VERSION = 'v1';

const SPEECH_ANALYSIS_INSTRUCTIONS = `You are an expert speech coach.
Evaluate the transcript and return strict JSON only.

Focus on:
- clarityAndStructure
- concisenessAndWordChoice
- emotionalResonance
- toneAndPresence
- audienceConnection
- improvements
- overallScore

Requirements:
- score fields must be numbers from 1 to 10
- each feedback field must be concise and specific
- improvements must contain exactly 3 short action items
- do not wrap the JSON in markdown`;

export function buildAnalysisInput(transcript: string, topic: string, framework: string) {
  return `${SPEECH_ANALYSIS_INSTRUCTIONS}

Topic: ${topic}
Framework: ${framework}

Transcript:
${transcript}`;
}

export function normalizeTranscript(transcript: string, maxChars: number) {
  const trimmed = transcript.trim();
  if (trimmed.length <= maxChars) {
    return {
      transcript: trimmed,
      isTrimmed: false,
    };
  }

  return {
    transcript: `${trimmed.slice(0, maxChars).trimEnd()}…`,
    isTrimmed: true,
  };
}

export function parseAnalysisResponse(output: string): SpeechAnalysis {
  const jsonMatch = output.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('No JSON found in analysis response');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
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
      ? parsed.improvements.slice(0, 3).map(String)
      : ['Clarify your opening', 'Trim filler words', 'End with a stronger takeaway'],
    overallScore: Number(parsed.overallScore) || 5,
  };
}

export function mapFeedbackRecord(row: Record<string, unknown>): SpeechFeedbackRecord {
  const analysis = row.analysis_json as SpeechFeedbackRecord['analysis'];

  return {
    id: String(row.id),
    createdAt: String(row.created_at),
    topicText: String(row.topic_text),
    frameworkId: row.framework_id ? String(row.framework_id) : null,
    frameworkName: String(row.framework_name),
    transcript: String(row.transcript),
    analysis,
    overallScore: row.overall_score ? Number(row.overall_score) : null,
    transcriptCharCount: Number(row.transcript_char_count ?? 0),
    promptVersion: row.prompt_version ? String(row.prompt_version) : null,
  };
}
