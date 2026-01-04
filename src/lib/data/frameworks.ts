import { Framework } from '../types';

export const frameworks: Framework[] = [
  {
    id: 'prep',
    name: 'PREP',
    acronym: 'PREP',
    bestFor: 'General opinions, arguments, and persuasive responses',
    steps: [
      {
        label: 'Point',
        shortDesc: 'State your main point',
        detailedDesc: 'Begin with a clear, concise statement of your position or main idea. This anchors your speech and tells the audience exactly what you believe.',
        examplePhrases: [
          'I believe that...',
          'My position is...',
          'The key point here is...',
          'What matters most is...',
        ],
        suggestedSeconds: 30,
      },
      {
        label: 'Reason',
        shortDesc: 'Explain why',
        detailedDesc: 'Provide the logical reasoning or rationale behind your point. This is the "because" that supports your claim.',
        examplePhrases: [
          'The reason I say this is...',
          'This matters because...',
          'This is important due to...',
          'The logic here is...',
        ],
        suggestedSeconds: 45,
      },
      {
        label: 'Example',
        shortDesc: 'Give a specific example',
        detailedDesc: 'Illustrate your point with a concrete example from personal experience, current events, history, or hypothetical scenarios.',
        examplePhrases: [
          'For instance...',
          'Let me give you an example...',
          'I experienced this when...',
          'Consider the case of...',
        ],
        suggestedSeconds: 60,
      },
      {
        label: 'Point',
        shortDesc: 'Restate your main point',
        detailedDesc: 'Circle back to reinforce your original point, perhaps with slightly different wording. This creates a satisfying conclusion.',
        examplePhrases: [
          'So in conclusion...',
          'This is why I firmly believe...',
          'And that\'s exactly why...',
          'To summarize...',
        ],
        suggestedSeconds: 30,
      },
    ],
    tips: [
      'Keep your initial point crisp and memorable',
      'Use only ONE strong example rather than several weak ones',
      'Your closing point can be stronger than your opening',
    ],
  },
  {
    id: 'star',
    name: 'STAR',
    acronym: 'STAR',
    bestFor: 'Personal stories, achievements, and interview-style questions',
    steps: [
      {
        label: 'Situation',
        shortDesc: 'Set the scene',
        detailedDesc: 'Describe the context and background. When and where did this happen? What was the environment? Set up the story.',
        examplePhrases: [
          'Last year, when I was...',
          'There was a time when...',
          'Picture this scenario...',
          'I found myself in a situation where...',
        ],
        suggestedSeconds: 30,
      },
      {
        label: 'Task',
        shortDesc: 'Define the challenge',
        detailedDesc: 'Explain what needed to be done. What was your responsibility? What problem needed solving? What was at stake?',
        examplePhrases: [
          'I was responsible for...',
          'The challenge was to...',
          'I needed to...',
          'My goal was to...',
        ],
        suggestedSeconds: 30,
      },
      {
        label: 'Action',
        shortDesc: 'Describe what you did',
        detailedDesc: 'Detail the specific steps you took. Focus on YOUR actions and decisions. This is the heart of your story.',
        examplePhrases: [
          'I decided to...',
          'First, I... Then I...',
          'I took the initiative to...',
          'My approach was to...',
        ],
        suggestedSeconds: 60,
      },
      {
        label: 'Result',
        shortDesc: 'Share the outcome',
        detailedDesc: 'Explain what happened as a result. Quantify if possible. What did you learn? What was the impact?',
        examplePhrases: [
          'As a result...',
          'This led to...',
          'The outcome was...',
          'What I learned was...',
        ],
        suggestedSeconds: 45,
      },
    ],
    tips: [
      'Focus on YOUR actions, not the team\'s',
      'Include specific numbers or metrics when possible',
      'End with what you learned, even if the result wasn\'t perfect',
    ],
  },
  {
    id: 'past-present-future',
    name: 'Past-Present-Future',
    acronym: 'PPF',
    bestFor: 'Trends, evolution, predictions, and change-related topics',
    steps: [
      {
        label: 'Past',
        shortDesc: 'How things were',
        detailedDesc: 'Describe the historical context or previous state. What was the situation before? How did things used to be?',
        examplePhrases: [
          'In the past...',
          'Traditionally...',
          'Before this...',
          'Looking back...',
        ],
        suggestedSeconds: 50,
      },
      {
        label: 'Present',
        shortDesc: 'How things are now',
        detailedDesc: 'Describe the current state. What\'s happening today? What has changed? What are we experiencing now?',
        examplePhrases: [
          'Today, we see...',
          'Currently...',
          'Now, the situation is...',
          'At present...',
        ],
        suggestedSeconds: 55,
      },
      {
        label: 'Future',
        shortDesc: 'Where things are heading',
        detailedDesc: 'Share your vision or prediction. What comes next? What should we do? What will happen?',
        examplePhrases: [
          'Looking ahead...',
          'In the future...',
          'I predict that...',
          'Moving forward, we should...',
        ],
        suggestedSeconds: 60,
      },
    ],
    tips: [
      'Create a clear narrative arc of change',
      'Use specific time markers when possible',
      'The future section is your chance to inspire action',
    ],
  },
  {
    id: 'problem-solution-benefit',
    name: 'Problem-Solution-Benefit',
    acronym: 'PSB',
    bestFor: 'Business proposals, pitches, and advocacy',
    steps: [
      {
        label: 'Problem',
        shortDesc: 'Identify the issue',
        detailedDesc: 'Clearly articulate the problem or pain point. Make the audience feel the urgency. Why does this matter?',
        examplePhrases: [
          'The challenge we face is...',
          'Many people struggle with...',
          'The problem is...',
          'We\'re losing... because...',
        ],
        suggestedSeconds: 50,
      },
      {
        label: 'Solution',
        shortDesc: 'Present the fix',
        detailedDesc: 'Offer a clear, actionable solution. How do we address this problem? What specific steps should be taken?',
        examplePhrases: [
          'The solution is to...',
          'We can fix this by...',
          'Here\'s what we should do...',
          'I propose that...',
        ],
        suggestedSeconds: 55,
      },
      {
        label: 'Benefit',
        shortDesc: 'Show the positive outcome',
        detailedDesc: 'Paint a picture of the improved future. What will be better? How will people benefit? What\'s the payoff?',
        examplePhrases: [
          'The result will be...',
          'This means we\'ll...',
          'The benefit is...',
          'Imagine a world where...',
        ],
        suggestedSeconds: 60,
      },
    ],
    tips: [
      'Make the problem feel urgent and relatable',
      'Keep the solution simple and memorable',
      'Quantify benefits when possible',
    ],
  },
  {
    id: 'what-so-what-now-what',
    name: 'What? So What? Now What?',
    acronym: 'WSN',
    bestFor: 'Insights, observations, and calls to action',
    steps: [
      {
        label: 'What?',
        shortDesc: 'State the observation',
        detailedDesc: 'Share a fact, observation, or situation. What happened? What are you seeing? What\'s the reality?',
        examplePhrases: [
          'Here\'s what\'s happening...',
          'I\'ve observed that...',
          'The fact is...',
          'Let me share what I noticed...',
        ],
        suggestedSeconds: 45,
      },
      {
        label: 'So What?',
        shortDesc: 'Explain the significance',
        detailedDesc: 'Why does this matter? What are the implications? Help the audience understand the importance.',
        examplePhrases: [
          'This matters because...',
          'The implication is...',
          'Why should we care? Because...',
          'This is significant since...',
        ],
        suggestedSeconds: 55,
      },
      {
        label: 'Now What?',
        shortDesc: 'Call to action',
        detailedDesc: 'What should we do about it? Give specific, actionable next steps. Inspire action.',
        examplePhrases: [
          'Here\'s what we need to do...',
          'I encourage you to...',
          'The next step is...',
          'Let\'s commit to...',
        ],
        suggestedSeconds: 65,
      },
    ],
    tips: [
      'Make your observation concrete and specific',
      'The "So What" is often the most important part',
      'End with one clear, doable action',
    ],
  },
  {
    id: 'pros-cons-conclusion',
    name: 'Pros-Cons-Conclusion',
    acronym: 'PCC',
    bestFor: 'Balanced analysis, decision-making, and debates',
    steps: [
      {
        label: 'Pros',
        shortDesc: 'List the advantages',
        detailedDesc: 'Present the positive aspects, benefits, or arguments in favor. Be fair and thorough.',
        examplePhrases: [
          'On the positive side...',
          'The advantages include...',
          'What works well is...',
          'Proponents argue that...',
        ],
        suggestedSeconds: 55,
      },
      {
        label: 'Cons',
        shortDesc: 'List the disadvantages',
        detailedDesc: 'Present the negative aspects, drawbacks, or counterarguments. Be honest about limitations.',
        examplePhrases: [
          'However, the downsides are...',
          'On the other hand...',
          'The challenges include...',
          'Critics point out that...',
        ],
        suggestedSeconds: 55,
      },
      {
        label: 'Conclusion',
        shortDesc: 'Share your verdict',
        detailedDesc: 'After weighing both sides, give your recommendation or conclusion. Take a stance.',
        examplePhrases: [
          'After weighing both sides...',
          'On balance, I believe...',
          'My recommendation is...',
          'Considering everything...',
        ],
        suggestedSeconds: 55,
      },
    ],
    tips: [
      'Present the strongest arguments on each side',
      'Be genuinely balanced before giving your verdict',
      'Your conclusion should feel earned, not predetermined',
    ],
  },
  {
    id: '5ws',
    name: 'The 5 Ws',
    acronym: '5Ws',
    bestFor: 'Events, news, stories, and descriptive topics',
    steps: [
      {
        label: 'Who',
        shortDesc: 'The people involved',
        detailedDesc: 'Identify the key players, stakeholders, or characters. Who is affected? Who is responsible?',
        examplePhrases: [
          'The key people involved are...',
          'This affects...',
          'The main players are...',
          'We\'re talking about...',
        ],
        suggestedSeconds: 30,
      },
      {
        label: 'What',
        shortDesc: 'What happened or exists',
        detailedDesc: 'Describe the event, situation, or thing. What are we talking about? What occurred?',
        examplePhrases: [
          'What happened was...',
          'The situation is...',
          'Essentially, this is...',
          'We\'re dealing with...',
        ],
        suggestedSeconds: 35,
      },
      {
        label: 'When',
        shortDesc: 'The timing',
        detailedDesc: 'Establish the timeframe. When did this happen? When will it happen? What\'s the timeline?',
        examplePhrases: [
          'This occurred...',
          'The timeline is...',
          'Starting from...',
          'By the time...',
        ],
        suggestedSeconds: 25,
      },
      {
        label: 'Where',
        shortDesc: 'The location',
        detailedDesc: 'Specify the place or context. Where is this happening? What\'s the setting?',
        examplePhrases: [
          'This is taking place in...',
          'The location is...',
          'We see this happening in...',
          'Across...',
        ],
        suggestedSeconds: 25,
      },
      {
        label: 'Why',
        shortDesc: 'The reason or significance',
        detailedDesc: 'Explain the cause, motivation, or importance. Why does this matter? Why did it happen?',
        examplePhrases: [
          'The reason this matters is...',
          'This is important because...',
          'The cause was...',
          'What makes this significant...',
        ],
        suggestedSeconds: 50,
      },
    ],
    tips: [
      'Save "Why" for last—it\'s often the most impactful',
      'You can combine or skip elements that aren\'t relevant',
      'Great for organizing information quickly',
    ],
  },
  {
    id: 'cause-effect-remedy',
    name: 'Cause-Effect-Remedy',
    acronym: 'CER',
    bestFor: 'Problem analysis, root cause discussions, and solutions',
    steps: [
      {
        label: 'Cause',
        shortDesc: 'Identify the root cause',
        detailedDesc: 'Dig into why something happened. What\'s the underlying reason? Go beyond symptoms to find the source.',
        examplePhrases: [
          'The root cause is...',
          'This originated from...',
          'If we trace this back...',
          'The underlying reason is...',
        ],
        suggestedSeconds: 50,
      },
      {
        label: 'Effect',
        shortDesc: 'Describe the impact',
        detailedDesc: 'Explain the consequences and ripple effects. What has resulted from this cause? Who or what is affected?',
        examplePhrases: [
          'As a result...',
          'The consequences include...',
          'This has led to...',
          'The impact has been...',
        ],
        suggestedSeconds: 55,
      },
      {
        label: 'Remedy',
        shortDesc: 'Propose a solution',
        detailedDesc: 'Offer a fix that addresses the root cause, not just the symptoms. What should be done?',
        examplePhrases: [
          'To address this, we should...',
          'The solution lies in...',
          'We can remedy this by...',
          'Going forward, we need to...',
        ],
        suggestedSeconds: 60,
      },
    ],
    tips: [
      'Go deep on the cause—surface-level analysis isn\'t enough',
      'Connect your remedy back to the root cause',
      'Show how the remedy prevents future effects',
    ],
  },
];

export function getFrameworkById(id: string): Framework | undefined {
  return frameworks.find((f) => f.id === id);
}

export function getRandomFramework(excludeIds: string[] = []): Framework {
  const available = frameworks.filter((f) => !excludeIds.includes(f.id));
  const pool = available.length > 0 ? available : frameworks;
  return pool[Math.floor(Math.random() * pool.length)];
}
