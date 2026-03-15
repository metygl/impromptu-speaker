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
  {
    id: 'car',
    name: 'Context-Action-Result',
    acronym: 'CAR',
    bestFor: 'Concise behavioral interview answers and short accomplishment stories',
    objectiveIds: ['interviews', 'self-advocacy'],
    steps: [
      {
        label: 'Context',
        shortDesc: 'Set up the challenge quickly',
        detailedDesc:
          'Give just enough background for the listener to understand the situation, stakes, and your role.',
        examplePhrases: [
          'At the time, I was...',
          'The situation was...',
          'We were facing...',
          'The context was...',
        ],
        suggestedSeconds: 30,
      },
      {
        label: 'Action',
        shortDesc: 'Focus on what you did',
        detailedDesc:
          'Describe the key choices and actions you personally took. Keep the emphasis on your judgment and ownership.',
        examplePhrases: [
          'I decided to...',
          'My approach was...',
          'I stepped in to...',
          'What I did was...',
        ],
        suggestedSeconds: 60,
      },
      {
        label: 'Result',
        shortDesc: 'Close with impact',
        detailedDesc:
          'Explain what changed because of your actions. Quantify the outcome or highlight the lesson if the result was mixed.',
        examplePhrases: [
          'The result was...',
          'That led to...',
          'The impact was...',
          'What changed was...',
        ],
        suggestedSeconds: 45,
      },
    ],
    tips: [
      'Use CAR when STAR feels too long for the moment',
      'Keep the context lean so the action stays central',
      'End on impact, not effort',
    ],
  },
  {
    id: 'present-recent-future',
    name: 'Present-Recent-Future',
    acronym: 'PRF',
    bestFor: 'Interview introductions, career summaries, and "tell me about yourself" answers',
    objectiveIds: ['interviews', 'introductions'],
    steps: [
      {
        label: 'Present',
        shortDesc: 'Who you are now',
        detailedDesc:
          'Start with your current role, focus, or professional identity so the listener knows your present-day context.',
        examplePhrases: [
          'Right now, I...',
          'Currently, I work as...',
          'Today, my focus is...',
          'At the moment, I\'m...',
        ],
        suggestedSeconds: 30,
      },
      {
        label: 'Recent',
        shortDesc: 'What led here',
        detailedDesc:
          'Briefly explain the recent experiences that built credibility for what you do now.',
        examplePhrases: [
          'Before that, I...',
          'Recently, I...',
          'Leading into this, I...',
          'That builds on...',
        ],
        suggestedSeconds: 40,
      },
      {
        label: 'Future',
        shortDesc: 'Where you are headed',
        detailedDesc:
          'Close by connecting your background to the role, opportunity, or direction you want next.',
        examplePhrases: [
          'What I\'m looking for next is...',
          'That\'s why I\'m excited about...',
          'Going forward, I want to...',
          'The next step I\'m targeting is...',
        ],
        suggestedSeconds: 35,
      },
    ],
    tips: [
      'Keep this answer forward-looking, not autobiographical',
      'Your future section should sound specific and intentional',
      'Use this to connect your story to the exact opportunity',
    ],
  },
  {
    id: 'who-what-proof-goal',
    name: 'Who-What-Proof-Goal',
    acronym: 'WWPG',
    bestFor: 'Elevator pitches, recruiter intros, and compact value-focused self-introductions',
    objectiveIds: ['interviews', 'introductions'],
    steps: [
      {
        label: 'Who',
        shortDesc: 'Identity and role',
        detailedDesc:
          'State who you are professionally in plain language. Anchor the listener immediately.',
        examplePhrases: [
          'I\'m a...',
          'I work in...',
          'My background is in...',
          'I\'m currently...',
        ],
        suggestedSeconds: 20,
      },
      {
        label: 'What',
        shortDesc: 'Value you create',
        detailedDesc:
          'Explain the kind of problems you solve or the outcomes you help create.',
        examplePhrases: [
          'I help teams...',
          'My work focuses on...',
          'I usually solve...',
          'What I\'m best known for is...',
        ],
        suggestedSeconds: 25,
      },
      {
        label: 'Proof',
        shortDesc: 'Credibility signal',
        detailedDesc:
          'Add one specific result, customer, scope, or achievement that makes your claim believable.',
        examplePhrases: [
          'For example...',
          'Most recently, I...',
          'One result I\'m proud of is...',
          'That showed up when I...',
        ],
        suggestedSeconds: 25,
      },
      {
        label: 'Goal',
        shortDesc: 'Reason for the conversation',
        detailedDesc:
          'Close with where you are headed, what you are exploring, or the next step you want.',
        examplePhrases: [
          'Right now, I\'m looking to...',
          'I\'m especially interested in...',
          'That\'s why I wanted to connect...',
          'What I\'m exploring next is...',
        ],
        suggestedSeconds: 20,
      },
    ],
    tips: [
      'This framework works best when it feels conversational, not rehearsed',
      'Use one proof point, not a resume dump',
      'Make the goal section easy to respond to',
    ],
  },
  {
    id: 'role-value-direction',
    name: 'Role-Value-Direction',
    acronym: 'RVD',
    bestFor: 'Short self-introductions for new teams, clients, and networking contexts',
    objectiveIds: ['introductions'],
    steps: [
      {
        label: 'Role',
        shortDesc: 'Name your lane',
        detailedDesc:
          'Share your role or professional lane in simple language so the audience knows what to anchor on.',
        examplePhrases: [
          'My role is...',
          'I sit in...',
          'I lead...',
          'I\'m joining as...',
        ],
        suggestedSeconds: 20,
      },
      {
        label: 'Value',
        shortDesc: 'How you help',
        detailedDesc:
          'Explain the value you create for teammates, customers, or the business.',
        examplePhrases: [
          'I help by...',
          'The value I try to bring is...',
          'I usually contribute by...',
          'My focus is to...',
        ],
        suggestedSeconds: 30,
      },
      {
        label: 'Direction',
        shortDesc: 'What you are leaning into',
        detailedDesc:
          'Close by signaling where you want to collaborate, learn, or add momentum next.',
        examplePhrases: [
          'I\'m especially excited to...',
          'Over the next few months, I want to...',
          'I\'m looking forward to...',
          'Where I\'d love to contribute is...',
        ],
        suggestedSeconds: 25,
      },
    ],
    tips: [
      'Ideal for first meetings because it is clear without sounding salesy',
      'Make the value leg concrete enough that others know when to pull you in',
      'Direction should invite collaboration',
    ],
  },
  {
    id: 'context-interest-ask',
    name: 'Context-Interest-Ask',
    acronym: 'CIA',
    bestFor: 'Networking outreach, warm reconnects, and informational conversations',
    objectiveIds: ['networking'],
    steps: [
      {
        label: 'Context',
        shortDesc: 'Why you are reaching out',
        detailedDesc:
          'Give a grounded reason for the conversation so the interaction feels natural instead of random.',
        examplePhrases: [
          'I wanted to reach out because...',
          'I came across your...',
          'We met when...',
          'The reason I\'m contacting you is...',
        ],
        suggestedSeconds: 25,
      },
      {
        label: 'Interest',
        shortDesc: 'What genuinely caught your attention',
        detailedDesc:
          'Show specific interest in the person, their path, or their work. This is where credibility and warmth show up.',
        examplePhrases: [
          'I was especially interested in...',
          'What stood out to me was...',
          'I admire how you...',
          'I\'m curious about...',
        ],
        suggestedSeconds: 30,
      },
      {
        label: 'Ask',
        shortDesc: 'Make a light, clear request',
        detailedDesc:
          'Close with a small, reasonable next step that is easy for the other person to accept.',
        examplePhrases: [
          'If you\'re open to it, I\'d love to...',
          'Would you be willing to...',
          'I\'d appreciate 15 minutes to...',
          'My ask is simply...',
        ],
        suggestedSeconds: 20,
      },
    ],
    tips: [
      'Keep the ask light and specific',
      'The interest section should prove you did your homework',
      'Good networking sounds curious, not extractive',
    ],
  },
  {
    id: 'background-bridge-question',
    name: 'Background-Bridge-Question',
    acronym: 'BBQ',
    bestFor: 'Live networking openers and first-contact conversations',
    objectiveIds: ['networking'],
    steps: [
      {
        label: 'Background',
        shortDesc: 'Offer a quick intro',
        detailedDesc:
          'Give a short introduction so the other person has a handle on who you are.',
        examplePhrases: [
          'I\'m currently...',
          'My background is in...',
          'I work on...',
          'I\'m here because...',
        ],
        suggestedSeconds: 20,
      },
      {
        label: 'Bridge',
        shortDesc: 'Find a shared thread',
        detailedDesc:
          'Create a natural bridge into the other person\'s experience, role, or perspective.',
        examplePhrases: [
          'I noticed that you...',
          'It sounds like we both...',
          'I was interested because...',
          'Your experience stood out to me since...',
        ],
        suggestedSeconds: 25,
      },
      {
        label: 'Question',
        shortDesc: 'Invite the other person in',
        detailedDesc:
          'Ask one thoughtful question that moves the conversation forward without putting pressure on it.',
        examplePhrases: [
          'How did you end up...',
          'What\'s been most interesting about...',
          'I\'d be curious how you think about...',
          'What advice would you have for...',
        ],
        suggestedSeconds: 20,
      },
    ],
    tips: [
      'Use one bridge, not three',
      'The question should be easy to answer and easy to expand',
      'This framework is for starting conversations, not closing deals',
    ],
  },
  {
    id: 'progress-blockers-next',
    name: 'Progress-Blockers-Next',
    acronym: 'PBN',
    bestFor: 'Weekly updates, standups, stakeholder communication, and project check-ins',
    objectiveIds: ['updates'],
    steps: [
      {
        label: 'Progress',
        shortDesc: 'What moved forward',
        detailedDesc:
          'State the most relevant progress since the last update. Lead with movement, not process noise.',
        examplePhrases: [
          'Since the last update...',
          'We completed...',
          'The main progress is...',
          'This week, we moved...',
        ],
        suggestedSeconds: 30,
      },
      {
        label: 'Blockers',
        shortDesc: 'What may slow or stop progress',
        detailedDesc:
          'Identify blockers, risks, or dependencies clearly so the listener understands what needs attention.',
        examplePhrases: [
          'The main blocker is...',
          'The risk I\'m watching is...',
          'What could slow us down is...',
          'The open dependency is...',
        ],
        suggestedSeconds: 25,
      },
      {
        label: 'Next',
        shortDesc: 'What happens now',
        detailedDesc:
          'Close with the immediate next step, owner, or decision needed so the update stays actionable.',
        examplePhrases: [
          'Next, we\'re...',
          'The immediate next step is...',
          'What I need from the group is...',
          'By next week, we plan to...',
        ],
        suggestedSeconds: 25,
      },
    ],
    tips: [
      'Use this when clarity matters more than narrative',
      'A blocker should be concrete enough for someone to help with it',
      'The next step should make momentum visible',
    ],
  },
  {
    id: 'achievement-impact-learning',
    name: 'Achievement-Impact-Learning',
    acronym: 'AIL',
    bestFor: 'Performance reviews, self-advocacy, and accomplishment recaps',
    objectiveIds: ['self-advocacy'],
    steps: [
      {
        label: 'Achievement',
        shortDesc: 'What you delivered',
        detailedDesc:
          'State the accomplishment clearly and frame your role in it.',
        examplePhrases: [
          'One accomplishment I\'m proud of is...',
          'I led...',
          'I delivered...',
          'A key result this cycle was...',
        ],
        suggestedSeconds: 30,
      },
      {
        label: 'Impact',
        shortDesc: 'Why it mattered',
        detailedDesc:
          'Translate the accomplishment into business, customer, or team impact rather than effort alone.',
        examplePhrases: [
          'That mattered because...',
          'The impact was...',
          'This improved...',
          'As a result, the team...',
        ],
        suggestedSeconds: 35,
      },
      {
        label: 'Learning',
        shortDesc: 'How you grew',
        detailedDesc:
          'Show maturity by articulating what you learned and how it improves your next move.',
        examplePhrases: [
          'What I learned was...',
          'This strengthened my ability to...',
          'Going forward, I\'ll...',
          'It taught me that...',
        ],
        suggestedSeconds: 25,
      },
    ],
    tips: [
      'This is stronger than a brag list because it ties results to growth',
      'Impact should be stated in business language when possible',
      'Use this when you want to sound reflective and promotion-ready',
    ],
  },
  {
    id: 'observation-impact-request',
    name: 'Observation-Impact-Request',
    acronym: 'OIR',
    bestFor: 'Difficult feedback, boundary-setting, and respectful correction conversations',
    objectiveIds: ['difficult-conversations'],
    steps: [
      {
        label: 'Observation',
        shortDesc: 'Describe what happened',
        detailedDesc:
          'Start with a concrete observation, not a character judgment. Keep it specific and neutral.',
        examplePhrases: [
          'I noticed that...',
          'In the last two meetings...',
          'What I\'ve seen is...',
          'A pattern I want to flag is...',
        ],
        suggestedSeconds: 30,
      },
      {
        label: 'Impact',
        shortDesc: 'Explain the effect',
        detailedDesc:
          'Share the effect on the work, team, customer, or relationship so the issue feels real rather than personal.',
        examplePhrases: [
          'The impact is...',
          'That creates...',
          'The challenge it causes is...',
          'What happens as a result is...',
        ],
        suggestedSeconds: 30,
      },
      {
        label: 'Request',
        shortDesc: 'Ask for a change',
        detailedDesc:
          'Make a specific request or propose a next step that moves the conversation toward resolution.',
        examplePhrases: [
          'What I\'d like going forward is...',
          'Can we agree to...',
          'My request is...',
          'The change I\'m asking for is...',
        ],
        suggestedSeconds: 25,
      },
    ],
    tips: [
      'The observation should be hard to argue with',
      'Keep the request behavioral and specific',
      'Use a calm tone so the structure can do the heavy lifting',
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
