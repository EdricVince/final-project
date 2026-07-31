import { ServiceUnavailableException } from '@nestjs/common';

// Mock the Anthropic SDK so we exercise the real prompt/parse logic without any
// network call. `mockCreate` is hoisted-safe (name starts with "mock").
const mockCreate = jest.fn();
jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({ messages: { create: mockCreate } })),
}));

import { AiService } from './ai.service';

const reply = (text: string) => ({ content: [{ type: 'text', text }] });

describe('AiService — AI generation paths (Anthropic mocked)', () => {
  const KEY = 'sk-ant-testkey1234567890';
  const originalKey = process.env.ANTHROPIC_API_KEY;
  let svc: AiService;

  beforeEach(() => {
    process.env.ANTHROPIC_API_KEY = KEY; // makes the lazy client non-null
    mockCreate.mockReset();
    svc = new AiService();
  });
  afterAll(() => { process.env.ANTHROPIC_API_KEY = originalKey; });

  describe('getWordOfTheDay', () => {
    it('parses the model JSON into a WordOfTheDay', async () => {
      mockCreate.mockResolvedValue(reply(JSON.stringify({
        word: 'serendipity', phonetic: '/ˌsɛrənˈdɪpɪti/', partOfSpeech: 'noun',
        definition: 'a happy accident', example: 'It was serendipity.', synonyms: ['luck'],
        difficulty: 'advanced', tip: 'ser-en-DIP-ity',
      })));
      const w = await svc.getWordOfTheDay();
      expect(w.word).toBe('serendipity');
      expect(w.difficulty).toBe('advanced');
      expect(w.synonyms).toEqual(['luck']);
    });

    it('tolerates prose / markdown fences around the JSON', async () => {
      mockCreate.mockResolvedValue(reply('Sure! Here you go:\n```json\n' + JSON.stringify({
        word: 'ephemeral', phonetic: 'p', partOfSpeech: 'adjective', definition: 'd',
        example: 'e', synonyms: [], difficulty: 'intermediate', tip: 't',
      }) + '\n```'));
      const w = await svc.getWordOfTheDay();
      expect(w.word).toBe('ephemeral');
    });

    it('throws ServiceUnavailable when the model call fails', async () => {
      mockCreate.mockRejectedValue(new Error('upstream down'));
      await expect(svc.getWordOfTheDay()).rejects.toBeInstanceOf(ServiceUnavailableException);
    });
  });

  describe('scanContent', () => {
    it('parses structured lesson content from pasted text', async () => {
      mockCreate.mockResolvedValue(reply(JSON.stringify({
        title: 'Photosynthesis', summary: 'How plants make food.', language: 'English',
        vocabulary: [{ term: 'chlorophyll', definition: 'green pigment', example: 'Leaves have chlorophyll.' }],
        quiz: [{ question: 'What is needed?', options: ['sun', 'a', 'b', 'c'], correct: 0, explanation: 'light' }],
        comprehension: [{ question: 'Why green?', answer: 'chlorophyll' }],
      })));
      const res = await svc.scanContent({ text: 'Photosynthesis is the process by which plants convert light into energy. '.repeat(3) });
      expect(res.title).toBe('Photosynthesis');
      expect(res.vocabulary).toHaveLength(1);
      expect(res.quiz[0].correct).toBe(0);
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });
  });
});
