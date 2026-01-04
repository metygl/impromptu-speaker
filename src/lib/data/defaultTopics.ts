import { Deck } from '../types';

export const defaultDeck: Deck = {
  id: 'default',
  name: 'General Topics',
  description: 'A diverse collection of impromptu speaking topics',
  isDefault: true,
  topics: [
    { id: '1', text: 'What is the most important quality in a leader?' },
    { id: '2', text: 'Should social media have age restrictions?' },
    { id: '3', text: 'What would you do with an extra hour each day?' },
    { id: '4', text: 'Is it better to be a specialist or a generalist?' },
    { id: '5', text: 'What is one thing you wish you had learned earlier in life?' },
    { id: '6', text: 'How has technology changed the way we communicate?' },
    { id: '7', text: 'What makes a good friend?' },
    { id: '8', text: 'Should we prioritize experience over education?' },
    { id: '9', text: 'What is the value of making mistakes?' },
    { id: '10', text: 'How do you handle criticism?' },
    { id: '11', text: 'What does success mean to you?' },
    { id: '12', text: 'Is it better to plan carefully or act spontaneously?' },
    { id: '13', text: 'What role does luck play in success?' },
    { id: '14', text: 'How do you stay motivated during difficult times?' },
    { id: '15', text: 'What is more important: talent or hard work?' },
    { id: '16', text: 'Should we follow our passion or be practical?' },
    { id: '17', text: 'What makes a great teacher?' },
    { id: '18', text: 'How has a book or movie changed your perspective?' },
    { id: '19', text: 'What is the importance of failure?' },
    { id: '20', text: 'How do you define happiness?' },
    { id: '21', text: 'What would you change about your industry or field?' },
    { id: '22', text: 'Is competition healthy or harmful?' },
    { id: '23', text: 'What is the best advice you have ever received?' },
    { id: '24', text: 'How do you balance work and personal life?' },
    { id: '25', text: 'What makes a community strong?' },
    { id: '26', text: 'Should we embrace change or preserve tradition?' },
    { id: '27', text: 'What is the role of empathy in decision-making?' },
    { id: '28', text: 'How do you approach a problem you have never faced before?' },
    { id: '29', text: 'What is more valuable: knowledge or creativity?' },
    { id: '30', text: 'How has a challenge shaped who you are today?' },
  ],
};

export function generateTopicId(): string {
  return `topic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateDeckId(): string {
  return `deck-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
