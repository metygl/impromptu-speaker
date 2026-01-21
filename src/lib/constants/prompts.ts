export const SPEECH_ANALYSIS_PROMPT = `I'm going to upload a transcript of me speaking.
I want you to analyze it and give me precise, high-value feedback to help me improve my overall communication.

Here's what I'd like you to do step-by-step:

**Clarity & Structure**
- Identify where my message is clear and where it becomes confusing or unfocused.
- Show me how I can tighten my structure so my message flows naturally and lands stronger.
- Suggest where I might need a clearer setup, transition, or conclusion.

**Conciseness & Word Choice**
- Highlight any filler words, redundancies, or long-winded sections that could be simplified.
- Suggest cleaner phrasing or stronger word choices that keep the rhythm conversational and confident.

**Emotional Resonance & Storytelling**
- Point out moments that feel flat and tell me how I could make them more engaging or emotionally impactful.
- Suggest where I could add storytelling, contrast, or curiosity to hook the listener.

**Tone & Presence**
- Evaluate the tone: does it sound authentic, confident, and connected?
- Suggest adjustments to rhythm, pacing, or energy that could make it more dynamic and alive.

**Audience Connection**
- Help me see whether I'm speaking to the audience or at them.
- Suggest language shifts that could make my message more relatable, human, and conversational.

**Practical Communication Advice**
- Give me 3–5 concrete changes I can make that would have the biggest immediate impact on my communication effectiveness.
- If relevant, include a short rewritten excerpt that shows what "great" would sound like.

Please respond in JSON format with the following structure:
{
  "clarityAndStructure": {
    "score": <number 1-10>,
    "feedback": "<detailed feedback>"
  },
  "concisenessAndWordChoice": {
    "score": <number 1-10>,
    "feedback": "<detailed feedback>"
  },
  "emotionalResonance": {
    "score": <number 1-10>,
    "feedback": "<detailed feedback>"
  },
  "toneAndPresence": {
    "score": <number 1-10>,
    "feedback": "<detailed feedback>"
  },
  "audienceConnection": {
    "score": <number 1-10>,
    "feedback": "<detailed feedback>"
  },
  "improvements": [
    "<improvement 1>",
    "<improvement 2>",
    "<improvement 3>"
  ],
  "overallScore": <number 1-10>
}`;

export function buildAnalysisPrompt(
  transcript: string,
  topic: string,
  framework: string
): string {
  return `${SPEECH_ANALYSIS_PROMPT}

**Context:**
- Topic: ${topic}
- Speaking Framework: ${framework}

**Transcript:**
${transcript}`;
}
