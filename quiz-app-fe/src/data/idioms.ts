export interface Idiom {
  id: number
  phrase: string
  meaning: string
  example: string
  category: 'success' | 'failure' | 'effort' | 'time' | 'money' | 'emotion' | 'social' | 'work' | 'luck' | 'conflict'
  difficulty: 'easy' | 'medium' | 'hard'
}

export const idioms: Idiom[] = [
  // EASY
  { id: 1,  phrase: 'Break a leg',               meaning: 'Good luck',                                           example: 'Your big presentation is today — break a leg!',                              category: 'luck',     difficulty: 'easy' },
  { id: 2,  phrase: 'Hit the sack',               meaning: 'Go to bed / sleep',                                  example: 'I\'m exhausted. I\'m going to hit the sack early tonight.',                  category: 'time',     difficulty: 'easy' },
  { id: 3,  phrase: 'Under the weather',          meaning: 'Feeling sick or unwell',                             example: 'She stayed home because she was feeling under the weather.',                  category: 'emotion',  difficulty: 'easy' },
  { id: 4,  phrase: 'Piece of cake',              meaning: 'Something very easy to do',                          example: 'The exam was a piece of cake — I finished in 20 minutes.',                   category: 'effort',   difficulty: 'easy' },
  { id: 5,  phrase: 'Cost an arm and a leg',      meaning: 'Very expensive',                                     example: 'That luxury car costs an arm and a leg.',                                    category: 'money',    difficulty: 'easy' },
  { id: 6,  phrase: 'Hit the nail on the head',   meaning: 'Describe something exactly right',                   example: 'You hit the nail on the head — that\'s exactly the problem.',                category: 'success',  difficulty: 'easy' },
  { id: 7,  phrase: 'Bite the bullet',            meaning: 'Endure a painful situation bravely',                 example: 'I hated going to the dentist, but I bit the bullet and made an appointment.', category: 'effort',   difficulty: 'easy' },
  { id: 8,  phrase: 'Let the cat out of the bag', meaning: 'Accidentally reveal a secret',                       example: 'He let the cat out of the bag about the surprise party.',                    category: 'social',   difficulty: 'easy' },
  { id: 9,  phrase: 'Once in a blue moon',        meaning: 'Very rarely',                                        example: 'We only get snow here once in a blue moon.',                                 category: 'time',     difficulty: 'easy' },
  { id: 10, phrase: 'Spill the beans',            meaning: 'Reveal secret information',                          example: 'Don\'t spill the beans — it\'s a surprise!',                                category: 'social',   difficulty: 'easy' },
  { id: 11, phrase: 'On the fence',               meaning: 'Undecided or neutral',                               example: 'I\'m still on the fence about which job offer to accept.',                   category: 'emotion',  difficulty: 'easy' },
  { id: 12, phrase: 'Beat around the bush',       meaning: 'Avoid getting to the main point',                    example: 'Stop beating around the bush and tell me what happened.',                    category: 'social',   difficulty: 'easy' },

  // MEDIUM
  { id: 13, phrase: 'Burn the midnight oil',      meaning: 'Work late into the night',                           example: 'She burned the midnight oil to finish her thesis on time.',                  category: 'work',     difficulty: 'medium' },
  { id: 14, phrase: 'Bite off more than you can chew', meaning: 'Take on more than you can handle',             example: 'He bit off more than he could chew by managing three projects at once.',     category: 'work',     difficulty: 'medium' },
  { id: 15, phrase: 'Hit the ground running',     meaning: 'Start something with great energy and enthusiasm',   example: 'She hit the ground running on her first day at the new job.',                category: 'work',     difficulty: 'medium' },
  { id: 16, phrase: 'The ball is in your court',  meaning: 'It\'s your turn to take action or make a decision',  example: 'I\'ve made my offer — the ball is in your court now.',                      category: 'conflict', difficulty: 'medium' },
  { id: 17, phrase: 'Pull someone\'s leg',        meaning: 'Joke or tease someone',                              example: 'Are you serious or just pulling my leg?',                                    category: 'social',   difficulty: 'medium' },
  { id: 18, phrase: 'Back to the drawing board',  meaning: 'Start something over from the beginning',            example: 'The prototype failed — it\'s back to the drawing board.',                   category: 'failure',  difficulty: 'medium' },
  { id: 19, phrase: 'Bite the dust',              meaning: 'Fail or die',                                        example: 'Three companies bit the dust during the economic crisis.',                   category: 'failure',  difficulty: 'medium' },
  { id: 20, phrase: 'Cut corners',                meaning: 'Do something poorly to save time or money',          example: 'The building collapsed because the contractor cut corners.',                  category: 'work',     difficulty: 'medium' },
  { id: 21, phrase: 'Get out of hand',            meaning: 'Become out of control',                              example: 'The argument got out of hand and turned into a fight.',                      category: 'conflict', difficulty: 'medium' },
  { id: 22, phrase: 'Go back to square one',      meaning: 'Start completely over',                              example: 'After the plan failed, we had to go back to square one.',                    category: 'failure',  difficulty: 'medium' },
  { id: 23, phrase: 'Hang in there',              meaning: 'Persist or keep going despite difficulties',         example: 'Hang in there — things will get better soon.',                               category: 'effort',   difficulty: 'medium' },
  { id: 24, phrase: 'Let sleeping dogs lie',      meaning: 'Avoid bringing up old conflicts or problems',        example: 'Don\'t mention the argument — let sleeping dogs lie.',                       category: 'conflict', difficulty: 'medium' },
  { id: 25, phrase: 'Miss the boat',              meaning: 'Miss an opportunity',                                example: 'He missed the boat by not investing early in that company.',                  category: 'failure',  difficulty: 'medium' },
  { id: 26, phrase: 'On thin ice',                meaning: 'In a risky or dangerous situation',                  example: 'You\'re on thin ice — one more mistake and you\'re fired.',                  category: 'conflict', difficulty: 'medium' },
  { id: 27, phrase: 'See eye to eye',             meaning: 'Agree with someone',                                 example: 'We don\'t always see eye to eye, but we respect each other.',                category: 'social',   difficulty: 'medium' },
  { id: 28, phrase: 'Steal someone\'s thunder',   meaning: 'Upstage someone or take their credit',               example: 'She stole my thunder by announcing the news before I could.',                 category: 'conflict', difficulty: 'medium' },
  { id: 29, phrase: 'The tip of the iceberg',     meaning: 'A small visible part of a larger problem',           example: 'The corruption case is just the tip of the iceberg.',                        category: 'work',     difficulty: 'medium' },
  { id: 30, phrase: 'Under someone\'s thumb',     meaning: 'Controlled by another person',                       example: 'He\'s completely under his boss\'s thumb and can\'t make decisions.',         category: 'conflict', difficulty: 'medium' },

  // HARD
  { id: 31, phrase: 'Burn bridges',               meaning: 'Permanently damage a relationship',                  example: 'Don\'t burn bridges when you quit — you might need them again.',               category: 'social',   difficulty: 'hard' },
  { id: 32, phrase: 'Caught between a rock and a hard place', meaning: 'Facing two equally difficult choices', example: 'I was caught between a rock and a hard place deciding between the two jobs.',  category: 'conflict', difficulty: 'hard' },
  { id: 33, phrase: 'Devil\'s advocate',          meaning: 'Argue a position you don\'t necessarily believe',    example: 'Let me play devil\'s advocate — what if the plan fails?',                    category: 'social',   difficulty: 'hard' },
  { id: 34, phrase: 'Elephant in the room',       meaning: 'An obvious problem everyone avoids discussing',      example: 'The budget crisis is the elephant in the room nobody wants to address.',      category: 'conflict', difficulty: 'hard' },
  { id: 35, phrase: 'Go the extra mile',          meaning: 'Make more effort than required',                     example: 'She always goes the extra mile to ensure customer satisfaction.',              category: 'effort',   difficulty: 'hard' },
  { id: 36, phrase: 'Have a lot on your plate',   meaning: 'Be very busy with many responsibilities',            example: 'I can\'t take on new tasks — I already have a lot on my plate.',              category: 'work',     difficulty: 'hard' },
  { id: 37, phrase: 'Jump on the bandwagon',      meaning: 'Follow a trend because it\'s popular',               example: 'Everyone is jumping on the bandwagon and buying electric cars.',              category: 'social',   difficulty: 'hard' },
  { id: 38, phrase: 'Kill two birds with one stone', meaning: 'Accomplish two things with one action',           example: 'I combined my gym session with a client meeting — killing two birds with one stone.', category: 'effort', difficulty: 'hard' },
  { id: 39, phrase: 'Lose your touch',            meaning: 'No longer be as skilled as before',                  example: 'He used to be a great chef, but he seems to have lost his touch.',             category: 'failure',  difficulty: 'hard' },
  { id: 40, phrase: 'No pain, no gain',           meaning: 'You must work hard to achieve results',              example: 'You need to train harder — no pain, no gain.',                               category: 'effort',   difficulty: 'hard' },
  { id: 41, phrase: 'Read between the lines',     meaning: 'Understand the hidden meaning',                      example: 'Read between the lines — she\'s not happy with your work.',                  category: 'social',   difficulty: 'hard' },
  { id: 42, phrase: 'Sit on the fence',           meaning: 'Avoid taking sides in a dispute',                    example: 'He always sits on the fence instead of making a clear decision.',             category: 'conflict', difficulty: 'hard' },
  { id: 43, phrase: 'The last straw',             meaning: 'The final problem that causes someone to give up',   example: 'Missing the deadline was the last straw — he quit the project.',              category: 'emotion',  difficulty: 'hard' },
  { id: 44, phrase: 'Throw in the towel',         meaning: 'Give up or admit defeat',                            example: 'After fighting for two hours, he finally threw in the towel.',               category: 'failure',  difficulty: 'hard' },
  { id: 45, phrase: 'Turn a blind eye',           meaning: 'Ignore something you know is wrong',                 example: 'Management turned a blind eye to the safety violations.',                    category: 'conflict', difficulty: 'hard' },
]

export function generateIdiomQuestions(count = 10, difficulty?: 'easy' | 'medium' | 'hard') {
  const pool = difficulty ? idioms.filter(i => i.difficulty === difficulty) : idioms
  const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count)
  const allMeanings = idioms.map(i => i.meaning)

  return shuffled.map(idiom => {
    const wrongOptions = allMeanings
      .filter(m => m !== idiom.meaning)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
    const options = [idiom.meaning, ...wrongOptions].sort(() => Math.random() - 0.5)
    return {
      id: idiom.id,
      phrase: idiom.phrase,
      meaning: idiom.meaning,
      example: idiom.example,
      category: idiom.category,
      difficulty: idiom.difficulty,
      options,
    }
  })
}

export type IdiomQuestion = ReturnType<typeof generateIdiomQuestions>[number]
