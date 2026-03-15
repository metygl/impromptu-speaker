import { Deck, Topic } from '../types';

function createTopic(id: string, text: string, allowedFrameworkIds?: string[]): Topic {
  return {
    id,
    text,
    allowedFrameworkIds,
  };
}

export const builtInDecks: Deck[] = [
  {
    id: 'interview-behavioral',
    name: 'Behavioral Interviews',
    description:
      'Practice high-signal interview stories around leadership, conflict, ownership, and learning.',
    objectiveId: 'interviews',
    objectiveLabel: 'Interviews',
    allowedFrameworkIds: ['star', 'car', 'achievement-impact-learning'],
    isBuiltIn: true,
    topics: [
      createTopic('ib-1', 'Tell me about a time you had to solve an ambiguous problem.'),
      createTopic('ib-2', 'Describe a time you disagreed with a teammate and how you handled it.'),
      createTopic('ib-3', 'Tell me about a time you had too much on your plate and had to prioritize.'),
      createTopic('ib-4', 'Describe a time you made a mistake and what you did next.'),
      createTopic('ib-5', 'Tell me about a time you influenced someone without direct authority.'),
      createTopic('ib-6', 'Describe a time you improved a process, system, or workflow.'),
      createTopic('ib-7', 'Tell me about a time you received difficult feedback and how you responded.'),
      createTopic('ib-8', 'Describe a project you are especially proud of and why.'),
    ],
  },
  {
    id: 'interview-introductions',
    name: 'Tell Me About Yourself',
    description:
      'Practice concise career-story answers for interviews, recruiters, and hiring managers.',
    objectiveId: 'interviews',
    objectiveLabel: 'Interviews',
    allowedFrameworkIds: ['present-recent-future', 'who-what-proof-goal'],
    isBuiltIn: true,
    topics: [
      createTopic(
        'ii-1',
        'Answer "Tell me about yourself" for a role you are actively interviewing for.'
      ),
      createTopic(
        'ii-2',
        'Introduce your background to a recruiter in under 60 seconds.'
      ),
      createTopic(
        'ii-3',
        'Explain your career shift in a way that feels intentional and credible.'
      ),
      createTopic(
        'ii-4',
        'Summarize your current role and the kind of work you want to do next.'
      ),
      createTopic(
        'ii-5',
        'Give a polished answer to "Walk me through your resume."',
        ['present-recent-future']
      ),
      createTopic(
        'ii-6',
        'Introduce yourself to a hiring manager who only has one minute.',
        ['who-what-proof-goal']
      ),
    ],
  },
  {
    id: 'elevator-pitches',
    name: 'Elevator Pitches',
    description:
      'Train short, credible introductions that explain who you are, the value you create, and where you are headed.',
    objectiveId: 'introductions',
    objectiveLabel: 'Elevator Pitch',
    allowedFrameworkIds: ['who-what-proof-goal', 'role-value-direction'],
    isBuiltIn: true,
    topics: [
      createTopic('ep-1', 'Introduce yourself to a founder you meet after a panel.'),
      createTopic('ep-2', 'Explain what you do to someone outside your industry.'),
      createTopic('ep-3', 'Pitch your professional value in 30 seconds at a career fair.'),
      createTopic('ep-4', 'Introduce yourself to a new client on a kickoff call.'),
      createTopic('ep-5', 'Summarize your expertise to a senior leader you just met.'),
      createTopic(
        'ep-6',
        'Give a compact self-introduction for the first day on a new team.',
        ['role-value-direction']
      ),
    ],
  },
  {
    id: 'networking-conversations',
    name: 'Networking Conversations',
    description:
      'Practice openers, follow-ups, and low-pressure asks that build genuine professional relationships.',
    objectiveId: 'networking',
    objectiveLabel: 'Networking',
    allowedFrameworkIds: ['context-interest-ask', 'background-bridge-question'],
    isBuiltIn: true,
    topics: [
      createTopic(
        'nc-1',
        'Start a conversation with someone at an industry event without sounding transactional.',
        ['background-bridge-question']
      ),
      createTopic(
        'nc-2',
        'Reconnect with a weak tie and ask for a quick career conversation.',
        ['context-interest-ask']
      ),
      createTopic('nc-3', 'Ask a respected peer how they broke into their current role.'),
      createTopic('nc-4', 'Explain why you wanted to connect after reading someone’s post or article.'),
      createTopic('nc-5', 'Turn a casual introduction into a memorable networking exchange.'),
      createTopic('nc-6', 'Close a networking conversation with a natural next step.'),
    ],
  },
  {
    id: 'status-updates',
    name: 'Status Updates',
    description:
      'Practice concise progress updates with blockers, risks, and immediate next steps.',
    objectiveId: 'updates',
    objectiveLabel: 'Status Updates',
    allowedFrameworkIds: ['progress-blockers-next', 'what-so-what-now-what'],
    isBuiltIn: true,
    topics: [
      createTopic(
        'su-1',
        'Give your manager a weekly update on a project that is mostly on track.',
        ['progress-blockers-next']
      ),
      createTopic(
        'su-2',
        'Give a quick update on a launch that is slipping because of one critical dependency.',
        ['progress-blockers-next']
      ),
      createTopic(
        'su-3',
        'Summarize what changed this week, why it matters, and what the team should do next.',
        ['what-so-what-now-what']
      ),
      createTopic('su-4', 'Share a standup-style update with progress, blocker, and next move.'),
      createTopic('su-5', 'Give an executive update that highlights progress without drowning in detail.'),
      createTopic('su-6', 'Explain a risk that needs attention before it becomes a bigger problem.'),
    ],
  },
  {
    id: 'performance-review',
    name: 'Performance Review and Self-Advocacy',
    description:
      'Practice talking about accomplishments, impact, growth, and promotion readiness with specifics.',
    objectiveId: 'self-advocacy',
    objectiveLabel: 'Self-Advocacy',
    allowedFrameworkIds: ['achievement-impact-learning', 'star'],
    isBuiltIn: true,
    topics: [
      createTopic('pr-1', 'Describe your biggest accomplishment from the last six months.'),
      createTopic('pr-2', 'Explain the impact of a project where your work materially changed the outcome.'),
      createTopic('pr-3', 'Make the case that you are operating at the next level.'),
      createTopic('pr-4', 'Talk about a stretch assignment that accelerated your growth.'),
      createTopic('pr-5', 'Describe a win in terms of business impact, not just effort.'),
      createTopic(
        'pr-6',
        'Reflect on a challenge that made you better in your role.',
        ['achievement-impact-learning']
      ),
    ],
  },
  {
    id: 'proposal-pitches',
    name: 'Proposal and Recommendation Pitches',
    description:
      'Practice structured recommendations, business cases, and calls to action.',
    objectiveId: 'persuasion',
    objectiveLabel: 'Persuasion',
    allowedFrameworkIds: [
      'problem-solution-benefit',
      'pros-cons-conclusion',
      'what-so-what-now-what',
    ],
    isBuiltIn: true,
    topics: [
      createTopic('pp-1', 'Recommend one process change your team should make this quarter.'),
      createTopic('pp-2', 'Make the case for a tool, hire, or investment your team needs.'),
      createTopic('pp-3', 'Argue for a product or strategy decision with clear tradeoffs.'),
      createTopic(
        'pp-4',
        'Compare two options and recommend one after weighing both sides.',
        ['pros-cons-conclusion']
      ),
      createTopic(
        'pp-5',
        'Frame a painful problem, your proposed solution, and the payoff.',
        ['problem-solution-benefit']
      ),
      createTopic('pp-6', 'Share an observation, why it matters, and what leadership should do next.'),
    ],
  },
  {
    id: 'difficult-conversations',
    name: 'Difficult Conversations',
    description:
      'Practice clear, respectful conversations around feedback, boundaries, misalignment, and repair.',
    objectiveId: 'difficult-conversations',
    objectiveLabel: 'Difficult Conversations',
    allowedFrameworkIds: ['observation-impact-request', 'what-so-what-now-what'],
    isBuiltIn: true,
    topics: [
      createTopic(
        'dc-1',
        'Give a peer feedback about missed handoffs that are hurting the team.',
        ['observation-impact-request']
      ),
      createTopic(
        'dc-2',
        'Address recurring interruptions in meetings with a colleague.',
        ['observation-impact-request']
      ),
      createTopic('dc-3', 'Reset expectations after a project commitment was missed.'),
      createTopic('dc-4', 'Push back on an unrealistic request without sounding defensive.'),
      createTopic('dc-5', 'Talk through a disagreement with a teammate and move toward resolution.'),
      createTopic('dc-6', 'Explain why a pattern is a problem and what needs to change next.'),
    ],
  },
];

export const defaultBuiltInDeck = builtInDecks[0];

export function getBuiltInDeckById(deckId: string): Deck | undefined {
  return builtInDecks.find((deck) => deck.id === deckId);
}

export function isBuiltInDeckId(deckId: string): boolean {
  return builtInDecks.some((deck) => deck.id === deckId);
}

export function getAllDecks(customDecks: Deck[]): Deck[] {
  return [...builtInDecks, ...customDecks];
}

export function getDeckAllowedFrameworkIds(deck: Deck, fallbackIds: string[]): string[] {
  return deck.allowedFrameworkIds && deck.allowedFrameworkIds.length > 0
    ? deck.allowedFrameworkIds
    : fallbackIds;
}

export function getTopicAllowedFrameworkIds(
  deck: Deck,
  topic: Topic,
  fallbackIds: string[]
): string[] {
  return topic.allowedFrameworkIds && topic.allowedFrameworkIds.length > 0
    ? topic.allowedFrameworkIds
    : getDeckAllowedFrameworkIds(deck, fallbackIds);
}

export function generateTopicId(): string {
  return `topic-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function generateDeckId(): string {
  return `deck-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
