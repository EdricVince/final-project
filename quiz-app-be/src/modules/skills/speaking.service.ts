import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import type { EvaluateSpeakingDto, CefrLevel } from './dto/skills.dto';

@Injectable()
export class SpeakingService {
  private readonly logger = new Logger(SpeakingService.name);
  private readonly client: Anthropic | null;
  private lastExIdx = new Map<CefrLevel, number>();
  private lastPrIdx = new Map<CefrLevel, number>();

  constructor(private config: ConfigService) {
    const key = this.config.get<string>('ANTHROPIC_API_KEY');
    this.client = key && !key.includes('your-') ? new Anthropic({ apiKey: key }) : null;
  }

  async getExercise(level: CefrLevel = 'B1') {
    if (this.client) return this.generateExercise(level);
    return this.fallbackExercise(level);
  }

  async getSpeakingPrompt(level: CefrLevel = 'B1') {
    if (this.client) return this.generateSpeakingPrompt(level);
    return this.fallbackSpeakingPrompt(level);
  }

  async evaluate(dto: EvaluateSpeakingDto) {
    if (this.client) return this.evaluateSpeaking(dto);
    return this.fallbackEvaluation(dto);
  }

  private pickRandom<T>(pool: T[], lastIdx: number): { item: T; idx: number } {
    if (pool.length === 1) return { item: pool[0], idx: 0 };
    let idx: number;
    do { idx = Math.floor(Math.random() * pool.length); } while (idx === lastIdx);
    return { item: pool[idx], idx };
  }

  private readonly shadowingTopicsByLevel: Record<CefrLevel, string[]> = {
    A1: ['My Family', 'My Home', 'Numbers and Colors', 'Days of the Week', 'My Favourite Animal', 'Food I Like', 'The Weather Today', 'My School', 'Morning Routine', 'Greetings'],
    A2: ['My Best Friend', 'A Day at School', 'Shopping for Clothes', 'My Weekend Activities', 'Describing My Room', 'A Visit to the Doctor', 'My Hobbies', 'A Birthday Party', 'Cooking a Simple Meal', 'Going to the Market'],
    B1: ['Working from Home', 'A Memorable Holiday', 'Social Media and Teenagers', 'Public Transport Issues', 'Healthy Eating Habits', 'Learning a New Language', 'Choosing a Career Path', 'Environmental Awareness', 'City Life vs Village Life', 'Online Shopping Trends', 'Dealing with Stress', 'A Challenging Situation'],
    B2: ['The Impact of Artificial Intelligence', 'Urban Planning and Sustainability', 'Mental Health in the Workplace', 'The Role of Social Media in Modern Journalism', 'Cultural Identity and Globalisation', 'The Gig Economy', 'Climate Change Policy', 'The Future of Higher Education', 'Work-Life Balance Challenges', 'Digital Privacy Concerns'],
    C1: ['The Ethics of Genetic Engineering', 'Philosophical Aspects of Free Will', 'Economic Inequality and Social Mobility', 'The Psychology of Behavioural Change', 'Geopolitical Shifts in the 21st Century', 'Neuroscience and Human Consciousness', 'The Paradox of Choice in Consumer Society', 'Postcolonial Identity in Literature', 'Algorithmic Bias and Social Justice'],
    C2: ['The Metaphysics of Identity Over Time', 'Deconstruction of Modernist Narratives', 'The Epistemology of Scientific Knowledge', 'Linguistic Relativity and Thought', 'The Moral Philosophy of Consequentialism', 'Transhumanism and the Boundaries of Humanity', 'Postmodern Critiques of Grand Narratives', 'The Sociolinguistics of Power Dynamics'],
  };

  private readonly wordCountByLevel: Record<CefrLevel, number> = { A1: 45, A2: 75, B1: 110, B2: 160, C1: 210, C2: 270 };

  private readonly speakingTopicsByLevel: Record<CefrLevel, string[]> = {
    A1: ['your name and age', 'your family', 'your favourite colour', 'a pet you have or want', 'food you like'],
    A2: ['your school or work', 'your hobbies', 'your neighbourhood', 'a recent weekend', 'a person in your family'],
    B1: ['a memorable trip you took', 'a skill you want to learn', 'your daily routine', 'a book or film you enjoyed', 'a challenge you faced', 'technology you use every day', 'a traditional celebration in your country', 'an environmental issue you care about'],
    B2: ['the advantages and disadvantages of social media', 'how technology is changing education', 'the importance of cultural diversity', 'whether cities are better places to live than rural areas', 'the effects of globalisation on local cultures', 'work-life balance in modern society', 'how governments should address climate change'],
    C1: ['the impact of artificial intelligence on employment', 'whether economic growth is compatible with environmental sustainability', 'the role of the media in shaping public opinion', 'how social inequality affects mental health', 'the ethics of surveillance in a digital society', 'whether space exploration is worth the cost'],
    C2: ['the philosophical implications of a post-truth society', 'whether liberal democracy is the most resilient political system', 'how language shapes our perception of reality', 'the ethical boundaries of biotechnology', 'the relationship between individual freedom and collective responsibility'],
  };

  private async generateExercise(level: CefrLevel) {
    const topics = this.shadowingTopicsByLevel[level];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const wc = this.wordCountByLevel[level];
    const prompt = `Generate a ${level}-level English shadowing exercise on "${topic}".
The TEXT must be EXACTLY ~${wc} words of natural spoken English — complete sentences, no shortcuts.
Return ONLY valid JSON (no markdown):
{
  "id": "sp_${Date.now()}",
  "level": "${level}",
  "title": "concise exercise title",
  "topic": "${topic}",
  "text": "~${wc}-word shadowing text. Natural spoken English with varied vocabulary for ${level}. Full sentences, vivid detail.",
  "phonetic_highlights": [{"word": "word", "phonetic": "/fəˈnetɪk/", "tip": "Pronunciation tip"}],
  "key_phrases": [{"phrase": "phrase", "meaning": "meaning"}],
  "difficulty_notes": "What makes this text specifically challenging for ${level} learners"
}
phonetic_highlights: 4-6 words. key_phrases: 3-5 items.`;
    try {
      const msg = await this.client!.messages.create({ model: 'claude-haiku-4-5-20251001', max_tokens: 1200, messages: [{ role: 'user', content: prompt }] });
      const text = (msg.content[0] as any).text;
      const json = text.match(/\{[\s\S]*\}/)?.[0];
      return json ? JSON.parse(json) : this.fallbackExercise(level);
    } catch (e) {
      this.logger.error('Speaking exercise generation failed', e);
      return this.fallbackExercise(level);
    }
  }

  private async generateSpeakingPrompt(level: CefrLevel) {
    const topics = this.speakingTopicsByLevel[level];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const partWeights = level === 'A1' || level === 'A2' ? [1, 2] : [1, 2, 2, 3];
    const part = partWeights[Math.floor(Math.random() * partWeights.length)];
    const speakTime = part === 2 ? 120 : part === 3 ? 75 : 45;
    const prepTime = part === 2 ? 60 : 20;
    const partGuide = part === 1
      ? `Part 1 (personal questions): 2–3 personal questions about "${topic}". Simple direct questions.`
      : part === 2
        ? `Part 2 (cue card): "Describe ${topic}." followed by 4 bullet points starting with "You should say:".`
        : `Part 3 (abstract discussion): 2–3 analytical/opinion questions related to "${topic}". Higher order thinking.`;
    const prompt = `Generate a ${level}-level IELTS Speaking Part ${part} prompt about "${topic}".
${partGuide}
Vocabulary complexity must match ${level}.
Return ONLY valid JSON (no markdown):
{
  "id": "spq_${Date.now()}",
  "level": "${level}",
  "part": ${part},
  "topic": "3–5 word label",
  "question": "Full question text for Part ${part}",
  "bullet_points": ["say 1", "say 2", "say 3", "say 4"],
  "prep_time_seconds": ${prepTime},
  "speak_time_seconds": ${speakTime},
  "example_vocabulary": ["word1", "word2", "word3", "word4", "word5", "word6", "word7"]
}
bullet_points: 3–4 items. example_vocabulary: 6–8 words/phrases appropriate for ${level}.`;
    try {
      const msg = await this.client!.messages.create({ model: 'claude-haiku-4-5-20251001', max_tokens: 600, messages: [{ role: 'user', content: prompt }] });
      const text = (msg.content[0] as any).text;
      const json = text.match(/\{[\s\S]*\}/)?.[0];
      return json ? JSON.parse(json) : this.fallbackSpeakingPrompt(level);
    } catch (e) {
      this.logger.error('Speaking prompt generation failed', e);
      return this.fallbackSpeakingPrompt(level);
    }
  }

  private async evaluateSpeaking(dto: EvaluateSpeakingDto) {
    const level = dto.level ?? 'B1';
    const prompt = `You are an expert English pronunciation coach. Compare the student's speech to the target text.
Target: "${dto.target_text}"
Student said: "${dto.spoken_transcript}"
Level: ${level}
Return ONLY valid JSON:
{
  "overall_score": 78, "pronunciation_score": 75, "fluency_score": 80, "accuracy_score": 78,
  "word_errors": [{"target_word": "target", "spoken_word": "spoken", "error_type": "substitution|omission|addition|mispronunciation", "tip": "correction tip"}],
  "missed_words": ["word1"], "extra_words": ["word1"],
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "phonetic_tips": [{"sound": "/θ/", "tip": "tip"}],
  "overall_feedback": "2–3 sentences of personalised, encouraging feedback."
}
word_errors: up to 6. strengths and improvements: 2–3 each. phonetic_tips: up to 3.`;
    try {
      const msg = await this.client!.messages.create({ model: 'claude-haiku-4-5-20251001', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] });
      const text = (msg.content[0] as any).text;
      const json = text.match(/\{[\s\S]*\}/)?.[0];
      return json ? JSON.parse(json) : this.fallbackEvaluation(dto);
    } catch (e) {
      this.logger.error('Speaking evaluation failed', e);
      return this.fallbackEvaluation(dto);
    }
  }

  private readonly fallbackExercises: Record<CefrLevel, any[]> = {
    A1: [
      {
        title: 'My Family', topic: 'Family',
        text: `I have a small family. There are four people: my mother, my father, my sister, and me. My mother is a teacher and my father is a doctor. My sister is eight years old and very funny. We live in a small house near the park. Every evening we eat dinner together. On weekends we go to the park and play games. I love my family very much.`,
        phonetic_highlights: [
          { word: 'family', phonetic: '/ˈfæməli/', tip: "Three syllables: 'FAM-uh-lee'. Don't skip the middle." },
          { word: 'together', phonetic: '/təˈɡeðər/', tip: "Stress on 2nd syllable: 'tuh-GETH-er'. Voiced 'th'." },
        ],
        key_phrases: [{ phrase: 'very much', meaning: 'a lot' }, { phrase: 'On weekends', meaning: 'during Saturday and Sunday' }],
      },
      {
        title: 'My Morning Routine', topic: 'Daily Routine',
        text: `Every morning I wake up at seven o'clock. I wash my face with cold water and brush my teeth. Then I eat breakfast with my family. I like eggs and toast and orange juice. After breakfast I put on my school uniform and pack my bag. My mother gives me a kiss and I walk to school. The walk takes ten minutes. I say hello to my friends at the school gate.`,
        phonetic_highlights: [
          { word: 'breakfast', phonetic: '/ˈbrekfəst/', tip: "Two syllables: 'BREK-fust'. The 'ea' sounds like short 'e'." },
          { word: 'uniform', phonetic: '/ˈjuːnɪfɔːm/', tip: "Three syllables: 'YOU-nih-form'. Stress on first." },
        ],
        key_phrases: [{ phrase: 'After breakfast', meaning: 'when breakfast is finished' }, { phrase: 'say hello', meaning: 'greet someone' }],
      },
      {
        title: 'My Pet Cat', topic: 'Pets & Animals',
        text: `I have a cat called Luna. She is small and white with green eyes. Every morning she wakes me up because she wants food. I give her milk and biscuits in a red bowl. Luna loves to sleep on my bed all day. In the evening she plays with a ball of wool on the floor. Sometimes she jumps up on my desk when I do homework. She makes me laugh every day.`,
        phonetic_highlights: [
          { word: 'because', phonetic: '/bɪˈkɒz/', tip: "Stress on 2nd syllable: 'bih-KOZ'. Clear 'o' sound." },
          { word: 'sometimes', phonetic: '/ˈsʌmtaɪmz/', tip: "Two syllables: 'SUM-tymz'. Stress on first." },
        ],
        key_phrases: [{ phrase: 'all day', meaning: 'the entire day, from morning to night' }, { phrase: 'makes me laugh', meaning: 'causes me to laugh' }],
      },
      {
        title: 'My Favourite Food', topic: 'Food',
        text: `My favourite food is fried rice. My mother makes it every Sunday evening. She uses rice, eggs, carrots, and soy sauce. First she fries the vegetables in a hot pan. Then she adds the rice and cracks two eggs into it. She stirs everything together for five minutes. The smell is wonderful. We eat it together at the kitchen table. My little brother always asks for a second bowl.`,
        phonetic_highlights: [
          { word: 'favourite', phonetic: '/ˈfeɪvərɪt/', tip: "Three syllables: 'FAY-vuh-rit'. Stress on first." },
          { word: 'vegetables', phonetic: '/ˈvedʒtəbəlz/', tip: "Three syllables: 'VEJ-tuh-bulz'. Not four." },
        ],
        key_phrases: [{ phrase: 'First she...Then she', meaning: 'showing the order of steps' }, { phrase: 'asks for', meaning: 'requests something' }],
      },
      {
        title: 'My School Day', topic: 'School',
        text: `My school starts at eight o'clock in the morning. My favourite subject is art because I love drawing and painting. We have six lessons every day. At lunchtime I eat with my best friend in the cafeteria. We always choose the pasta because it is cheap and delicious. In the afternoon we have sport or music. School finishes at three thirty. I take the bus home and arrive in twenty minutes. I am always happy to see my dog at the door.`,
        phonetic_highlights: [
          { word: 'subject', phonetic: '/ˈsʌbdʒɪkt/', tip: "Two syllables: 'SUB-jekt'. Stress on first." },
          { word: 'cafeteria', phonetic: '/ˌkæfɪˈtɪəriə/', tip: "Five syllables: 'kaf-ih-TEER-ee-uh'. Stress on 3rd." },
        ],
        key_phrases: [{ phrase: 'at lunchtime', meaning: 'during the midday break for eating' }, { phrase: 'happy to see', meaning: 'pleased and glad when you see something' }],
      },
      {
        title: 'The Weekend', topic: 'Free Time',
        text: `On Saturday mornings I sleep until nine o'clock. When I get up I have cereal and fruit for breakfast. In the afternoon my father and I sometimes drive to the lake near our town. He fishes while I swim or read a book by the water. My mother brings sandwiches and we eat by the lake. In the evening we cook dinner together at home. Sunday is a quiet day. I do my homework and watch a film with the family.`,
        phonetic_highlights: [
          { word: 'sometimes', phonetic: '/ˈsʌmtaɪmz/', tip: "Two syllables: 'SUM-tymz'." },
          { word: 'sandwiches', phonetic: '/ˈsænwɪtʃɪz/', tip: "Three syllables: 'SAN-wih-chiz'. The 'd' is silent." },
        ],
        key_phrases: [{ phrase: 'sleep until', meaning: 'continue sleeping up to a certain time' }, { phrase: 'by the water', meaning: 'beside the water, at the edge of the lake' }],
      },
    ],
    A2: [
      {
        title: 'A Day at the Market', topic: 'Shopping',
        text: `Last Saturday, my mother and I went to the local market. It was busy and colourful. We needed to buy vegetables and fruit for the week. First we went to the vegetable stall and bought tomatoes, onions, and green beans. Then we found a fruit seller who had fresh mangoes and bananas. I asked how much the mangoes cost, and the seller said two dollars for five. That was very good value. We carried our shopping home in two big bags. The market is always a fun experience because you see so many people and fresh foods.`,
        phonetic_highlights: [
          { word: 'vegetables', phonetic: '/ˈvedʒtəbəlz/', tip: "Three syllables only: 'VEJ-tuh-bulz'." },
          { word: 'experience', phonetic: '/ɪkˈspɪəriəns/', tip: "Stress on 2nd syllable: 'ik-SPEER-ee-uns'." },
        ],
        key_phrases: [{ phrase: 'good value', meaning: 'worth the price; a fair deal' }, { phrase: 'how much does it cost', meaning: 'asking the price' }],
      },
      {
        title: 'My Favourite Hobby', topic: 'Hobbies',
        text: `My favourite hobby is drawing. I started drawing when I was six years old. I like to draw animals, especially cats and birds. I also draw landscapes sometimes. I use coloured pencils and felt-tip pens. Every evening after dinner, I sit at my desk and draw for about an hour. My friends think my drawings are very good. Last month I entered a drawing competition at school. I did not win first prize, but I got a special mention. I was very happy. Drawing helps me relax and feel calm after a busy day at school.`,
        phonetic_highlights: [
          { word: 'favourite', phonetic: '/ˈfeɪvərɪt/', tip: "Stress on 1st syllable: 'FAY-vuh-rit'." },
          { word: 'competition', phonetic: '/ˌkɒmpɪˈtɪʃən/', tip: "Four syllables: 'kom-puh-TI-shun'. Stress on 3rd." },
        ],
        key_phrases: [{ phrase: 'special mention', meaning: 'an award for something worthy but not first place' }, { phrase: 'helps me relax', meaning: 'makes me feel less stressed' }],
      },
      {
        title: 'My Best Friend', topic: 'Friendship',
        text: `My best friend is called Minh. We have been friends since primary school. He is tall with short black hair and a big smile. Minh is very kind and always makes me laugh when I am sad. We go to the same secondary school now. Every lunchtime we sit together and talk about music, films, and games. At weekends, we meet at the park and play basketball or ride our bicycles. Last summer we went to a water park together with our families. That was one of the best days of my life. I hope we will always be friends.`,
        phonetic_highlights: [
          { word: 'secondary', phonetic: '/ˈsekəndri/', tip: "Three syllables: 'SEK-un-dree'. Don't add extra." },
          { word: 'basketball', phonetic: '/ˈbɑːskɪtbɔːl/', tip: "Three syllables: 'BAS-kit-bawl'. Long 'a' in 'bas'." },
        ],
        key_phrases: [{ phrase: 'since primary school', meaning: 'from the time we were in elementary school' }, { phrase: 'one of the best days', meaning: 'an extremely memorable day' }],
      },
      {
        title: 'A School Trip', topic: 'School & Learning',
        text: `Last spring, our class took a trip to a science museum in the city. We travelled by bus and arrived at ten o'clock in the morning. A guide showed us around the different exhibitions. I was most excited by the space section, which had models of all the planets and a short film about astronauts. During lunch we ate our packed meals in the museum garden and talked about what we had seen. The bus ride home took one hour. Almost everyone fell asleep. That evening I told my parents everything I had learnt about the solar system. I hope we go back again next year.`,
        phonetic_highlights: [
          { word: 'exhibitions', phonetic: '/ˌeksɪˈbɪʃənz/', tip: "Four syllables: 'eks-ih-BIH-shunz'. Stress on 3rd." },
          { word: 'astronauts', phonetic: '/ˈæstrənɔːts/', tip: "Three syllables: 'AS-truh-nawts'. Stress on 1st." },
        ],
        key_phrases: [{ phrase: 'took a trip', meaning: 'went on a journey or excursion' }, { phrase: 'fell asleep', meaning: 'began sleeping unintentionally' }],
      },
      {
        title: 'My Favourite Season', topic: 'Weather & Nature',
        text: `My favourite season is autumn. The weather becomes cool and pleasant and the trees turn beautiful shades of orange, red, and yellow. I love walking through the park and hearing the dry leaves crunch under my feet. In autumn, school starts again after the summer holiday, and I enjoy buying new stationery and notebooks. The evenings get darker earlier, which means I can sit inside with a warm drink and read. My family often makes pumpkin soup in autumn, which fills the house with a wonderful smell. I find autumn much more peaceful than summer. Everything feels calm and a little bit magical.`,
        phonetic_highlights: [
          { word: 'beautiful', phonetic: '/ˈbjuːtɪfʊl/', tip: "Three syllables: 'BYOO-tih-ful'. Stress on 1st." },
          { word: 'stationery', phonetic: '/ˈsteɪʃənəri/', tip: "Four syllables: 'STAY-shuh-nuh-ree'. Don't confuse with 'stationary'." },
        ],
        key_phrases: [{ phrase: 'crunch under my feet', meaning: 'make a crackling sound when you step on them' }, { phrase: 'fills the house with', meaning: 'spreads a smell or feeling throughout the home' }],
      },
      {
        title: 'Helping at Home', topic: 'Family & Chores',
        text: `Every Saturday morning, I help my parents clean the house. I tidy my bedroom first, then I vacuum the living room carpet. My sister washes the dishes and my father cleans the bathroom. My mother usually prepares a big lunch while we are working. When everything is clean, we all feel very satisfied and relaxed. In the afternoon my parents sometimes let us choose an activity. We might go to the cinema, visit relatives, or simply sit in the garden and talk. I think helping at home is important because it teaches you responsibility. And it is much nicer to live in a clean, tidy house.`,
        phonetic_highlights: [
          { word: 'vacuum', phonetic: '/ˈvækjuəm/', tip: "Three syllables: 'VAK-yoo-um'. Often mispronounced as two." },
          { word: 'responsibility', phonetic: '/rɪˌspɒnsɪˈbɪlɪti/', tip: "Six syllables. Stress on 4th: 'ri-spon-sih-BIL-ih-tee'." },
        ],
        key_phrases: [{ phrase: 'satisfied and relaxed', meaning: 'feeling pleased and free from stress' }, { phrase: 'visit relatives', meaning: 'go to see members of your extended family' }],
      },
    ],
    B1: [
      {
        title: 'Remote Work Life', topic: 'Work & Career',
        text: `Working from home has completely changed the way many people structure their day. Without the daily commute, employees gain back precious time which they can use for exercise, family, or deeper focus. I personally find I am more productive in the mornings when I work from my home office. However, the boundaries between work and personal life can easily blur. It is tempting to check emails late at night or on weekends. To manage this, I set a firm rule to close my laptop by six every evening. Maintaining a clear routine is the key to making remote work sustainable and enjoyable over the long term. Not everyone has the discipline for it, but those who do often never want to return to a traditional office.`,
        phonetic_highlights: [
          { word: 'productive', phonetic: '/prəˈdʌktɪv/', tip: "Stress on 2nd syllable: 'pruh-DUK-tiv'." },
          { word: 'sustainable', phonetic: '/səˈsteɪnəbəl/', tip: "4 syllables: 'suh-STAY-nuh-bul'. Don't swallow the ending." },
          { word: 'boundaries', phonetic: '/ˈbaʊndriz/', tip: "2-3 syllables: 'BOWN-dreez'." },
        ],
        key_phrases: [{ phrase: 'blur the lines', meaning: 'make the difference between two things unclear' }, { phrase: 'in the long term', meaning: 'over a long period of time' }],
      },
      {
        title: 'Social Media and Teenagers', topic: 'Technology',
        text: `Social media has transformed how young people communicate and see themselves. On one hand, platforms allow teenagers to stay connected with friends, share creative work, and discover communities that share their interests. On the other hand, studies increasingly link heavy social media use with rising rates of anxiety and low self-esteem among young people. The carefully edited highlights that people post online rarely reflect real life, yet teenagers often compare their everyday experiences to these ideals. Schools are beginning to introduce digital literacy programmes to help students engage with social media more critically and healthily. Parents also play a crucial role in modelling balanced screen habits at home. The key question is not whether to ban these platforms but how to use them wisely.`,
        phonetic_highlights: [
          { word: 'increasingly', phonetic: '/ɪnˈkriːsɪŋli/', tip: "Four syllables: 'in-KREE-sing-lee'. Stress on 2nd." },
          { word: 'communities', phonetic: '/kəˈmjuːnɪtiz/', tip: "Four syllables: 'kuh-MYOO-nih-teez'. Stress on 2nd." },
          { word: 'critically', phonetic: '/ˈkrɪtɪkli/', tip: "Three syllables: 'KRIT-ik-lee'. Stress on 1st." },
        ],
        key_phrases: [{ phrase: 'on one hand...on the other hand', meaning: 'contrasting two points' }, { phrase: 'digital literacy', meaning: 'the ability to use and evaluate digital information safely' }],
      },
      {
        title: 'Learning a New Language', topic: 'Education',
        text: `Learning a new language is one of the most rewarding things a person can do, but it also demands consistent effort and patience. Many people give up when progress feels slow, especially in the early stages when every sentence feels like a puzzle. However, studies show that even thirty minutes of daily practice leads to significant improvement over time. The key is to find activities you genuinely enjoy — watching films, listening to podcasts, or speaking with native speakers online. Making mistakes is a natural and necessary part of the process. In fact, the learners who progress fastest are often those who are not afraid to speak imperfectly from the very beginning, because real communication builds confidence far faster than any textbook exercise.`,
        phonetic_highlights: [
          { word: 'consistent', phonetic: '/kənˈsɪstənt/', tip: "Three syllables: 'kun-SIS-tent'. Stress on 2nd." },
          { word: 'significant', phonetic: '/sɪɡˈnɪfɪkənt/', tip: "Four syllables: 'sig-NIF-ih-kunt'. Stress on 2nd." },
          { word: 'confidence', phonetic: '/ˈkɒnfɪdəns/', tip: "Three syllables: 'KON-fih-duns'. Stress on 1st." },
        ],
        key_phrases: [{ phrase: 'give up', meaning: 'stop trying; abandon an effort' }, { phrase: 'builds confidence', meaning: 'gradually increases your self-belief and assurance' }],
      },
      {
        title: 'Healthy Eating Habits', topic: 'Health & Wellbeing',
        text: `There is growing awareness among young people today about the link between diet and mental wellbeing, not just physical health. Research suggests that eating a variety of colourful vegetables, whole grains, and foods rich in omega-3 fatty acids can genuinely improve mood and concentration. However, many students find it difficult to maintain a balanced diet, especially when living away from home for the first time. Fast food is cheap, quick, and easily available, while cooking from scratch requires time and skills that schools rarely teach. Introducing nutrition education as a compulsory subject in secondary school could help young people build habits that benefit them throughout their lives. After all, what we eat every day shapes not only our bodies but our minds.`,
        phonetic_highlights: [
          { word: 'awareness', phonetic: '/əˈweənəs/', tip: "Three syllables: 'uh-WAIR-ness'. Stress on 2nd." },
          { word: 'concentration', phonetic: '/ˌkɒnsənˈtreɪʃən/', tip: "Five syllables: 'kon-sun-TRAY-shun'. Stress on 4th." },
          { word: 'compulsory', phonetic: '/kəmˈpʌlsəri/', tip: "Four syllables: 'kum-PUL-suh-ree'. Stress on 2nd." },
        ],
        key_phrases: [{ phrase: 'from scratch', meaning: 'from the very beginning; using raw ingredients' }, { phrase: 'shapes our minds', meaning: 'has a significant effect on how we think and feel' }],
      },
      {
        title: 'City Life vs Country Life', topic: 'Lifestyle',
        text: `Many people dream of moving to the countryside for a quieter, more peaceful life, but the reality can be quite different from the fantasy. Rural areas offer fresh air, natural beauty, and a strong sense of community, yet they often lack the job opportunities, healthcare facilities, and cultural activities that cities provide. For young people especially, cities offer freedom, diversity, and a stimulating pace of life. The ideal, perhaps, is a town that combines the best of both worlds — small enough to feel human and community-oriented, but large enough to have good transport links, decent schools, and some variety in daily life. Where you live ultimately shapes your values, relationships, and sense of who you are, so the decision deserves careful thought.`,
        phonetic_highlights: [
          { word: 'facilities', phonetic: '/fəˈsɪlɪtiz/', tip: "Four syllables: 'fuh-SIL-ih-teez'. Stress on 2nd." },
          { word: 'community', phonetic: '/kəˈmjuːnɪti/', tip: "Four syllables: 'kuh-MYOO-nih-tee'. Stress on 2nd." },
          { word: 'stimulating', phonetic: '/ˈstɪmjʊleɪtɪŋ/', tip: "Four syllables: 'STIM-yuh-lay-ting'. Stress on 1st." },
        ],
        key_phrases: [{ phrase: 'the best of both worlds', meaning: 'combining advantages of two different options' }, { phrase: 'careful thought', meaning: 'serious and deliberate consideration' }],
      },
      {
        title: 'A Memorable Journey', topic: 'Travel & Adventure',
        text: `Three years ago I had the chance to travel by train across a large part of my country for the first time. The journey took almost twelve hours and I was nervous about spending so long alone. However, the experience turned out to be completely wonderful. The landscape changed dramatically every few hours — from flat agricultural plains to wooded hills and eventually a dramatic coastline. I shared a compartment with an elderly couple who told me stories about how the country had changed during their lifetime. By the time I arrived at my destination, I felt I had learned more than I would have in any classroom. It reminded me that travel is not just about reaching a place, but about everything you discover along the way.`,
        phonetic_highlights: [
          { word: 'dramatically', phonetic: '/drəˈmætɪkli/', tip: "Four syllables: 'druh-MAT-ik-lee'. Stress on 2nd." },
          { word: 'agricultural', phonetic: '/ˌæɡrɪˈkʌltʃərəl/', tip: "Five syllables: 'ag-rih-KUL-chuh-rul'. Stress on 3rd." },
          { word: 'compartment', phonetic: '/kəmˈpɑːtmənt/', tip: "Three syllables: 'kum-PART-munt'. Stress on 2nd." },
        ],
        key_phrases: [{ phrase: 'turned out to be', meaning: 'proved to be; became in the end' }, { phrase: 'along the way', meaning: 'during the process or journey itself' }],
      },
    ],
    B2: [
      {
        title: 'Urban Sustainability', topic: 'Environment & Cities',
        text: `As urban populations continue to swell, city planners face the formidable challenge of building environments that are both liveable and ecologically responsible. The concept of the "smart city" has emerged as a promising framework, integrating data-driven technologies to optimise energy use, reduce waste, and improve public services. Cities like Singapore and Copenhagen have pioneered green building codes and cycling infrastructure that significantly reduce carbon emissions. However, critics argue that technological solutions alone cannot address the root causes of urban inequality. Without meaningful investment in affordable housing and public transport, sustainability initiatives risk becoming the exclusive privilege of wealthier residents. True urban sustainability must be socially inclusive as well as environmentally sound, ensuring that the benefits of green innovation are distributed equitably across all communities.`,
        phonetic_highlights: [
          { word: 'formidable', phonetic: '/ˈfɔːmɪdəbəl/', tip: "4 syllables: 'FOR-mi-duh-bul'. Stress on 1st syllable." },
          { word: 'ecologically', phonetic: '/ˌiːkəˈlɒdʒɪkli/', tip: "5 syllables: 'ee-kuh-LOJ-ik-lee'. Stress on 3rd." },
          { word: 'infrastructure', phonetic: '/ˈɪnfrəstrʌktʃər/', tip: "4 syllables: 'IN-fruh-struk-chur'. Stress on 1st." },
        ],
        key_phrases: [{ phrase: 'data-driven', meaning: 'based on analysis of data' }, { phrase: 'root causes', meaning: 'the original fundamental reasons for a problem' }],
      },
      {
        title: 'The Gig Economy', topic: 'Work & Economics',
        text: `The rise of platform-based work has fundamentally disrupted traditional employment models. Millions of people now earn their living as independent contractors through apps like Uber, Deliveroo, and Fiverr. Proponents argue that this arrangement offers unparalleled flexibility, allowing individuals to set their own schedules and pursue multiple income streams simultaneously. Yet the reality for many gig workers is precarious: they lack access to sick pay, pension contributions, and the legal protections afforded to permanent employees. This asymmetry of power between platforms and workers has sparked a growing legal and political debate about how labour law should evolve in a digitally mediated economy. Several countries have begun reclassifying gig workers as employees, forcing platforms to extend benefits, though the long-term implications remain hotly contested.`,
        phonetic_highlights: [
          { word: 'precarious', phonetic: '/prɪˈkeəriəs/', tip: "4 syllables: 'prih-KAIR-ee-us'. Stress on 2nd." },
          { word: 'asymmetry', phonetic: '/eɪˈsɪmɪtri/', tip: "4 syllables: 'ay-SIM-uh-tree'. Stress on 2nd." },
          { word: 'simultaneously', phonetic: '/ˌsɪməlˈteɪniəsli/', tip: "6 syllables. Stress on 3rd: 'sim-ul-TAY-nee-us-lee'." },
        ],
        key_phrases: [{ phrase: 'income streams', meaning: 'different sources of money' }, { phrase: 'hotly contested', meaning: 'strongly disputed' }],
      },
      {
        title: 'Mental Health in the Workplace', topic: 'Health & Society',
        text: `The growing conversation around mental health in professional settings represents a significant cultural shift, particularly in industries that have traditionally prized resilience and long hours above all else. Burnout — defined as chronic stress leading to physical and emotional exhaustion — has been officially recognised by the World Health Organisation as an occupational phenomenon, signalling that employer responsibility now extends beyond physical safety to psychological welfare. Progressive companies have introduced mental health days, counselling services, and flexible working arrangements to help employees better manage the boundary between work and personal life. Critics caution, however, that surface-level perks can obscure deeper structural problems: punishing workloads, toxic management cultures, and expectations of constant digital availability outside office hours. Real progress requires organisations to rethink not just their wellbeing policies, but their fundamental attitudes towards productivity and what it means to treat employees as whole human beings.`,
        phonetic_highlights: [
          { word: 'exhaustion', phonetic: '/ɪɡˈzɔːstʃən/', tip: "Three syllables: 'ig-ZAWST-shun'. The 'x' sounds like 'gz'." },
          { word: 'psychological', phonetic: '/ˌsaɪkəˈlɒdʒɪkəl/', tip: "Five syllables: 'sy-kuh-LOJ-ih-kul'. Stress on 3rd." },
          { word: 'availability', phonetic: '/əˌveɪləˈbɪlɪti/', tip: "Six syllables: 'uh-vay-luh-BIL-ih-tee'. Stress on 4th." },
        ],
        key_phrases: [{ phrase: 'surface-level', meaning: 'dealing only with what is visible; not addressing deeper issues' }, { phrase: 'occupational phenomenon', meaning: 'a problem directly caused by or related to work' }],
      },
      {
        title: 'The Future of Higher Education', topic: 'Education',
        text: `Universities across the world are confronting an existential challenge posed by the rise of online learning platforms, professional certification programmes, and growing employer scepticism towards formal qualifications. Traditional higher education remains deeply prestigious, but its justification — that it produces well-rounded, critical thinkers prepared for a complex world — is being tested by its escalating costs and the growing number of graduates whose degrees bear little relation to their eventual careers. Proponents of radical reform argue that universities should become more vocational, more flexible, and more responsive to a rapidly changing labour market. Defenders of liberal education counter that such thinking is dangerously short-sighted: the ability to analyse evidence, communicate clearly, and adapt to new information is precisely what an AI-driven economy will demand most. The debate ultimately reflects a deeper question about what education is for — individual advancement or the cultivation of a thoughtful, informed citizenry.`,
        phonetic_highlights: [
          { word: 'existential', phonetic: '/ˌeɡzɪˈstenʃəl/', tip: "Four syllables: 'eg-zis-TEN-shul'. Stress on 3rd." },
          { word: 'scepticism', phonetic: '/ˈskeptɪsɪzəm/', tip: "Four syllables: 'SKEP-tih-siz-um'. Stress on 1st." },
          { word: 'vocational', phonetic: '/vəʊˈkeɪʃənəl/', tip: "Four syllables: 'voh-KAY-shun-ul'. Stress on 2nd." },
        ],
        key_phrases: [{ phrase: 'bear little relation to', meaning: 'have almost no connection with something' }, { phrase: 'liberal education', meaning: 'broad academic education focused on critical thinking, not job-specific training' }],
      },
      {
        title: 'Cultural Identity and Globalisation', topic: 'Culture & Society',
        text: `The tension between preserving cultural identity and embracing the benefits of globalisation is one of the defining challenges of the contemporary era. On one hand, the global exchange of food, music, fashion, and ideas has enriched societies in ways that would have been unimaginable a century ago. Young people today can access cultural products from every corner of the planet with a few taps on a smartphone. On the other hand, there is legitimate concern that the dominance of a handful of large technology and media companies is gradually homogenising cultural expression and marginalising minority languages and traditions. Effective cultural policy must celebrate diversity without romanticising isolation, encouraging citizens to be genuinely bicultural — deeply rooted in their own heritage while fully open to the rest of the world. The health of global culture depends on maintaining this delicate balance.`,
        phonetic_highlights: [
          { word: 'homogenising', phonetic: '/həˈmɒdʒənaɪzɪŋ/', tip: "Five syllables: 'huh-MOJ-uh-ny-zing'. Stress on 2nd." },
          { word: 'marginalising', phonetic: '/ˈmɑːdʒɪnəlaɪzɪŋ/', tip: "Five syllables: 'MAR-jih-nuh-ly-zing'. Stress on 1st." },
          { word: 'romanticising', phonetic: '/rəʊˈmæntɪsaɪzɪŋ/', tip: "Five syllables: 'roh-MAN-tih-sy-zing'. Stress on 2nd." },
        ],
        key_phrases: [{ phrase: 'legitimate concern', meaning: 'a worry that is justified and reasonable' }, { phrase: 'delicate balance', meaning: 'a careful equilibrium that is easily disturbed' }],
      },
      {
        title: 'The Role of Art in Society', topic: 'Arts & Culture',
        text: `In times of economic pressure, arts education is frequently among the first casualties of budget cuts, reflecting a persistent belief that creativity is a luxury rather than a necessity. This view fundamentally misunderstands the relationship between artistic thinking and broader social flourishing. A society that does not invest in its artists, musicians, writers, and theatre-makers impoverishes not only its cultural life but its capacity for empathy, innovation, and constructive dissent. The arts have historically served as the conscience of society — giving voice to the marginalised, challenging comfortable assumptions, and imagining alternatives to the present order. Furthermore, the creative industries generate substantial economic value and are among the most dynamic sectors in contemporary economies. Treating the arts as an optional extra in education sends exactly the wrong message about what a fully human life looks like, and what kind of citizens a democratic society needs.`,
        phonetic_highlights: [
          { word: 'impoverishes', phonetic: '/ɪmˈpɒvərɪʃɪz/', tip: "Four syllables: 'im-POV-uh-rish-iz'. Stress on 2nd." },
          { word: 'dissent', phonetic: '/dɪˈsent/', tip: "Two syllables: 'dih-SENT'. Stress on 2nd. Don't confuse with 'descent'." },
          { word: 'flourishing', phonetic: '/ˈflʌrɪʃɪŋ/', tip: "Three syllables: 'FLUR-ish-ing'. Stress on 1st." },
        ],
        key_phrases: [{ phrase: 'giving voice to', meaning: 'providing a means of expression for people who are not heard' }, { phrase: 'constructive dissent', meaning: 'disagreement expressed in a way that is productive and helpful' }],
      },
    ],
    C1: [
      {
        title: 'AI and Employment', topic: 'Technology & Society',
        text: `The accelerating deployment of artificial intelligence across industries has reignited debates about the future of human labour that economists and philosophers have wrestled with for centuries. Unlike previous waves of automation, which primarily displaced routine manual work, AI systems are now increasingly capable of performing cognitive tasks once considered the exclusive domain of highly trained professionals — from legal research and medical diagnosis to financial analysis and creative writing. Optimists contend that, as with earlier technological revolutions, new categories of work will emerge to absorb displaced workers. Sceptics counter that the pace and breadth of this disruption may outstrip the economy's capacity to adapt, potentially entrenching structural unemployment. What seems incontrovertible is that the nature of human expertise itself is being fundamentally redefined, demanding a wholesale rethinking of education, social safety nets, and the very concept of meaningful work in a world increasingly mediated by algorithms.`,
        phonetic_highlights: [
          { word: 'incontrovertible', phonetic: '/ˌɪnˌkɒntrəˈvɜːtɪbəl/', tip: "6 syllables: 'in-kon-truh-VUR-tuh-bul'. Stress on 4th." },
          { word: 'entrenching', phonetic: '/ɪnˈtrentʃɪŋ/', tip: "3 syllables: 'in-TREN-ching'. Clear initial vowel." },
          { word: 'sceptics', phonetic: '/ˈskeptɪks/', tip: "The 'sc' is pronounced /sk/. 'SKEP-tiks'." },
        ],
        key_phrases: [{ phrase: 'exclusive domain', meaning: 'an area belonging only to a specific group' }, { phrase: 'outstrip capacity', meaning: 'exceed the ability to cope or respond' }],
      },
      {
        title: 'Digital Privacy and Surveillance', topic: 'Ethics & Technology',
        text: `The architecture of the modern internet is built upon a paradox: services that are nominally free are, in fact, funded by the relentless commodification of personal data. Every search query, purchasing decision, and social interaction is logged, analysed, and sold to advertisers who deploy increasingly sophisticated behavioural targeting. Defenders of this model argue that users receive genuine value in exchange — personalised services, free communication tools, and access to global information — and that consent, however imperfectly obtained, legitimises the transaction. Critics insist that this framing obscures a profound imbalance: ordinary users cannot meaningfully comprehend the scope of data collected about them, let alone anticipate its downstream uses. As algorithmic systems grow more powerful, questions of surveillance, manipulation, and cognitive autonomy are no longer abstract philosophical concerns but pressing civic imperatives that demand robust regulatory responses from democratic governments worldwide.`,
        phonetic_highlights: [
          { word: 'commodification', phonetic: '/kəˌmɒdɪfɪˈkeɪʃən/', tip: "6 syllables: 'kuh-mod-ih-fih-KAY-shun'. Stress on 5th." },
          { word: 'legitimises', phonetic: '/lɪˈdʒɪtɪmaɪzɪz/', tip: "5 syllables: 'lih-JIT-ih-my-ziz'. Stress on 2nd." },
          { word: 'imperatives', phonetic: '/ɪmˈperətɪvz/', tip: "4 syllables: 'im-PER-uh-tivz'. Stress on 2nd." },
        ],
        key_phrases: [{ phrase: 'nominally free', meaning: 'free in name only; there is an indirect cost' }, { phrase: 'downstream uses', meaning: 'how data or products are used later in the chain' }],
      },
      {
        title: 'Behavioural Economics and Public Policy', topic: 'Psychology & Governance',
        text: `The emergence of behavioural economics has fundamentally challenged the rational-actor model that dominated economic thinking for much of the twentieth century. By drawing on insights from cognitive psychology, researchers like Daniel Kahneman and Richard Thaler have demonstrated that human decision-making is systematically irrational in predictable ways — we are loss-averse rather than gain-seeking, heavily influenced by how choices are framed, and prone to discounting future consequences in favour of immediate rewards. These findings have significant implications for public policy. Rather than relying exclusively on financial incentives or regulatory mandates, governments can design choice architectures that nudge citizens towards healthier, more financially responsible, and more environmentally sustainable decisions without restricting their freedom to choose otherwise. Enrolment defaults in pension schemes and organ donation opt-out systems have already demonstrated measurable real-world impact, though critics raise important ethical questions about whether such manipulation is compatible with individual autonomy.`,
        phonetic_highlights: [
          { word: 'systematically', phonetic: '/ˌsɪstəˈmætɪkli/', tip: "Five syllables: 'sis-tuh-MAT-ik-lee'. Stress on 3rd." },
          { word: 'architectures', phonetic: '/ˈɑːkɪtektʃəz/', tip: "Four syllables: 'AR-kih-tek-chuz'. Stress on 1st." },
          { word: 'autonomy', phonetic: '/ɔːˈtɒnəmi/', tip: "Four syllables: 'aw-TON-uh-mee'. Stress on 2nd." },
        ],
        key_phrases: [{ phrase: 'choice architecture', meaning: 'the way options are designed and presented to influence decisions' }, { phrase: 'loss-averse', meaning: 'more motivated to avoid losses than to acquire equivalent gains' }],
      },
      {
        title: 'The Psychology of Creativity', topic: 'Psychology & Arts',
        text: `Popular culture tends to portray creativity as a mysterious gift bestowed upon a select few — the solitary genius who produces great works through inspired bursts of innate talent. Psychologists and neuroscientists paint a considerably more mundane and, in many ways, more encouraging picture. Creativity, on their account, is less a property of exceptional individuals than a cognitive process available to almost everyone: the capacity to form novel connections between existing concepts, to tolerate ambiguity, and to persist through the frustration of repeated failure. Studies of highly creative individuals consistently reveal the importance of domain expertise combined with what researchers call psychological safety — the freedom to explore ideas without fear of ridicule or immediate judgment. Organisations that claim to value innovation but punish failure fundamentally misunderstand how creative insight actually develops. The most fertile conditions for original thinking are sustained, unhurried reflection combined with broad exposure to disciplines far beyond one's immediate field of expertise.`,
        phonetic_highlights: [
          { word: 'portrayed', phonetic: '/pɔːˈtreɪd/', tip: "Two syllables: 'paw-TRAYD'. Stress on 2nd." },
          { word: 'psychological', phonetic: '/ˌsaɪkəˈlɒdʒɪkəl/', tip: "Five syllables: 'sy-kuh-LOJ-ih-kul'. Stress on 3rd." },
          { word: 'ambiguity', phonetic: '/ˌæmbɪˈɡjuːɪti/', tip: "Five syllables: 'am-bih-GYOO-ih-tee'. Stress on 3rd." },
        ],
        key_phrases: [{ phrase: 'tolerate ambiguity', meaning: 'feel comfortable with uncertainty and unclear situations' }, { phrase: 'psychological safety', meaning: 'a climate where people feel safe to take risks and share ideas' }],
      },
      {
        title: 'The Geopolitics of Climate Change', topic: 'Environment & Politics',
        text: `The geopolitical dimensions of climate change represent one of the most complex negotiation challenges in the history of international relations. The problem is structurally asymmetric: countries that have historically contributed most to atmospheric carbon concentrations are generally wealthier and better equipped to adapt, while those facing the most severe consequences — small island states, sub-Saharan nations, coastal developing economies — bear the least historical responsibility and have the fewest resources to respond. The concept of climate justice has emerged to address this imbalance, insisting that developed nations have an obligation not merely to reduce their own emissions but to finance adaptation in vulnerable countries. Progress in multilateral forums has been painfully slow, constrained by competing national interests, short electoral cycles that discourage long-term investment, and the powerful lobbying influence of fossil fuel industries. Whether the international community can transcend these structural barriers before the window for meaningful action closes entirely remains the defining geopolitical question of this century.`,
        phonetic_highlights: [
          { word: 'asymmetric', phonetic: '/ˌeɪsɪˈmetrɪk/', tip: "Four syllables: 'ay-sih-MET-rik'. Stress on 3rd." },
          { word: 'multilateral', phonetic: '/ˌmʌltiˈlætərəl/', tip: "Five syllables: 'mul-tih-LAT-uh-rul'. Stress on 3rd." },
          { word: 'trajectory', phonetic: '/ˈtrædʒɪktəri/', tip: "Four syllables: 'TRAJ-ik-tuh-ree'. Stress on 1st." },
        ],
        key_phrases: [{ phrase: 'climate justice', meaning: 'the principle that those least responsible for climate change should not bear its greatest costs' }, { phrase: 'electoral cycles', meaning: 'the recurring period between elections that shapes political priorities' }],
      },
      {
        title: 'Post-Colonial Identity in Literature', topic: 'Literature & Culture',
        text: `Post-colonial literature occupies a uniquely complex position in the global literary canon, simultaneously claiming space within and challenging the very standards by which literary value has historically been assessed. Writers such as Chinua Achebe, Salman Rushdie, and Chimamanda Ngozi Adichie have not simply added new voices to an existing conversation but fundamentally questioned its assumptions — about what constitutes universal experience, which narratives deserve to be told, and in whose language they should be expressed. The decision to write in the colonial language — whether English, French, or Portuguese — is itself politically charged. Some authors view it as appropriation and empowerment, transforming the master's tools; others, following Ngũgĩ wa Thiong'o, argue that true decolonisation of the mind requires writing in indigenous languages accessible to the communities whose stories are being told. This tension between accessibility and authenticity generates some of the most stimulating debates in contemporary literary criticism, raising questions that extend well beyond literature into politics, identity, and the long aftermath of empire.`,
        phonetic_highlights: [
          { word: 'simultaneously', phonetic: '/ˌsɪməlˈteɪniəsli/', tip: "Six syllables: 'sim-ul-TAY-nee-us-lee'. Stress on 3rd." },
          { word: 'authenticity', phonetic: '/ˌɔːθenˈtɪsɪti/', tip: "Five syllables: 'aw-then-TIS-ih-tee'. Stress on 3rd." },
          { word: 'decolonisation', phonetic: '/diːˌkɒlənɪˈzeɪʃən/', tip: "Six syllables. Stress on 5th: 'dee-kol-uh-nih-ZAY-shun'." },
        ],
        key_phrases: [{ phrase: 'literary canon', meaning: 'the body of works considered most important and influential in a literary tradition' }, { phrase: 'politically charged', meaning: 'carrying significant political meaning or implications' }],
      },
    ],
    C2: [
      {
        title: 'Free Will and Determinism', topic: 'Philosophy',
        text: `The question of whether human beings possess genuine free will or are merely complex deterministic systems executing the inevitable consequences of prior causes has occupied philosophers since antiquity and shows no sign of resolution. Compatibilists attempt to dissolve the apparent tension by redefining freedom not as exemption from causal necessity but as action arising from one's own desires and deliberative reasoning, unimpeded by external coercion. Hard determinists reject this manoeuvre as a linguistic sleight of hand, insisting that if every mental event is ultimately traceable to neurochemical processes shaped by genetics and environment, then the experience of agency is an epiphenomenon — a convincing but causally inert narrative we tell ourselves. The emergence of neuroscience as an arbitrating discipline has complicated rather than clarified matters: evidence that unconscious brain activity precedes conscious awareness of a decision unsettles intuitive notions of authorship. Yet the implications of thoroughgoing determinism — for moral responsibility, criminal justice, and the phenomenology of personhood — are so radical that even those who accept its logical force often find themselves unable to abandon the first-person sense of being a genuine author of their own lives.`,
        phonetic_highlights: [
          { word: 'epiphenomenon', phonetic: '/ˌepɪfɪˈnɒmɪnɒn/', tip: "6 syllables: 'ep-ih-fih-NOM-ih-non'. Stress on 4th syllable." },
          { word: 'compatibilists', phonetic: '/kəmˈpætɪbɪlɪsts/', tip: "5 syllables: 'kum-PAT-ih-bil-ists'. Stress on 2nd." },
          { word: 'phenomenology', phonetic: '/fɪˌnɒmɪˈnɒlədʒi/', tip: "6 syllables: 'fih-nom-ih-NOL-uh-jee'. Stress on 4th." },
        ],
        key_phrases: [{ phrase: 'sleight of hand', meaning: 'a clever but deceptive use of language or reasoning' }, { phrase: 'causally inert', meaning: 'having no actual causal effect on events' }],
      },
      {
        title: 'The Epistemology of Scientific Knowledge', topic: 'Philosophy of Science',
        text: `The philosophical question of what distinguishes genuine scientific knowledge from mere opinion or superstition is more contested than the public discourse around "trusting the science" typically acknowledges. Karl Popper's criterion of falsifiability — the proposition that a claim is scientific only if it could in principle be proven false — remains influential but has faced sustained criticism for failing to capture how science actually operates in practice. Thomas Kuhn's theory of paradigm shifts offers a more sociologically realistic account, suggesting that scientific communities do not simply accumulate facts but operate within conceptual frameworks that determine which questions are worth asking and which anomalies can be safely ignored. Paradigm shifts, when they occur, are rarely precipitated by the simple accumulation of disconfirming evidence; they involve complex social dynamics, generational turnover, and fierce resistance from established practitioners. More radically, Paul Feyerabend's provocative argument that science has no unique method challenges us to think carefully about the relationship between intellectual authority and social power, complicating the confidence with which scientific consensus is sometimes invoked in political debate.`,
        phonetic_highlights: [
          { word: 'falsifiability', phonetic: '/ˌfɔːlsɪfaɪəˈbɪlɪti/', tip: "Seven syllables. Stress on 5th: 'fawl-sih-fy-uh-BIL-ih-tee'." },
          { word: 'epistemology', phonetic: '/ɪˌpɪstɪˈmɒlədʒi/', tip: "Six syllables: 'ih-pis-tih-MOL-uh-jee'. Stress on 4th." },
          { word: 'paradigm', phonetic: '/ˈpærədaɪm/', tip: "Three syllables: 'PAR-uh-dym'. The 'g' is silent." },
        ],
        key_phrases: [{ phrase: 'disconfirming evidence', meaning: 'evidence that contradicts or weakens an existing hypothesis' }, { phrase: 'institutional authority', meaning: 'power derived from established organisations or structures' }],
      },
      {
        title: 'Memory, Identity, and Personal Continuity', topic: 'Philosophy of Mind',
        text: `Personal identity over time presents philosophy with one of its most resistant paradoxes. The physical constituents of the human body are almost entirely replaced over a period of years, the memories that define our sense of self are demonstrably unreliable and reconstructive rather than archival, and the psychological continuity that we experience as a persistent self may be, as Derek Parfit influentially argued, not a deep metaphysical fact but a matter of degree — something that admits of more or less, rather than the all-or-nothing quality we instinctively attribute to it. These abstract considerations have unexpectedly concrete implications for how we think about moral responsibility and legal culpability. Neuroscientific research on memory reconsolidation suggests that every time we recall a memory, we subtly alter it; the prospect of pharmacological intervention to dampen traumatic memories raises questions about whether the person who emerges from such treatment is, in a meaningful sense, the same person who underwent the original experience. The transhumanist prospect of digital mind uploading sharpens this puzzle to its logical extreme: if a perfect computational simulation of your brain were created and your biological substrate destroyed, would that simulation be you, or merely an extremely convincing replica of you?`,
        phonetic_highlights: [
          { word: 'reconsolidation', phonetic: '/ˌriːkənˌsɒlɪˈdeɪʃən/', tip: "Six syllables. Stress on 5th: 'ree-kun-sol-ih-DAY-shun'." },
          { word: 'pharmacological', phonetic: '/ˌfɑːməkəˈlɒdʒɪkəl/', tip: "Six syllables: 'far-muh-kuh-LOJ-ih-kul'. Stress on 4th." },
          { word: 'metaphysical', phonetic: '/ˌmetəˈfɪzɪkəl/', tip: "Five syllables: 'met-uh-FIZ-ih-kul'. Stress on 3rd." },
        ],
        key_phrases: [{ phrase: 'admits of more or less', meaning: 'exists on a spectrum or continuum rather than as an absolute' }, { phrase: 'biological substrate', meaning: 'the physical material — cells, neurons, tissue — that underlies a mental or physical process' }],
      },
      {
        title: 'Language, Power, and the Politics of Silence', topic: 'Sociolinguistics & Politics',
        text: `The relationship between language and power is nowhere more starkly illustrated than in the systematic erasure of subaltern voices from official historical narratives. Dominant cultures have consistently controlled not only which stories are told but the very linguistic frameworks within which experience can be articulated and rendered legible to others. The philosopher Charles Taylor's concept of the hermeneutics of suspicion directs us to interrogate not merely what texts say explicitly but what their silences reveal — whose perspectives are structurally absent, which categories of experience fall outside the language of a given discourse, and who bears the cognitive and emotional cost of translation. The emergence of standpoint epistemology in feminist and post-colonial theory has formalised this intuition, arguing that knowledge claims cannot be adequately evaluated without accounting for the social position of those who make them. Critics of this view worry about its implications for objectivity: if all knowledge is positional, does this not collapse into relativism, where no claim can be adjudicated as more or less truthful than another? The most persuasive response does not deny the importance of objective standards but insists that those standards be applied reflexively — that the same critical scrutiny we bring to marginalised claims must be turned with equal rigour upon the taken-for-granted assumptions embedded in dominant discourse.`,
        phonetic_highlights: [
          { word: 'subaltern', phonetic: '/ˈsʌbəltɜːn/', tip: "Three syllables: 'SUB-ul-turn'. Stress on 1st." },
          { word: 'hermeneutics', phonetic: '/ˌhɜːmɪˈnjuːtɪks/', tip: "Four syllables: 'hur-mih-NYOO-tiks'. Stress on 3rd." },
          { word: 'epistemology', phonetic: '/ɪˌpɪstɪˈmɒlədʒi/', tip: "Six syllables: 'ih-pis-tih-MOL-uh-jee'. Stress on 4th." },
        ],
        key_phrases: [{ phrase: 'rendered legible', meaning: 'made comprehensible or readable to others' }, { phrase: 'standpoint epistemology', meaning: 'the view that knowledge is shaped by the social position and experience of the knower' }],
      },
      {
        title: 'The Paradox of Moral Progress', topic: 'Ethics & History',
        text: `The idea that humanity has made genuine moral progress over the centuries — that we now recognise rights and extend moral consideration to beings that previous eras treated with contempt — is both consoling and philosophically perplexing. The abolition of chattel slavery, the extension of the franchise to women, and the expanding legal recognition of LGBTQ+ rights all suggest a directional tendency in moral history that is difficult to account for within a purely relativist framework. And yet the same record that documents these advances also reveals that each generation tends to regard its own moral blind spots as natural, inevitable, or simply beneath consideration. What moral atrocities are we committing right now that future generations will look back upon with the same incomprehension with which we regard the slave trade? The philosopher Peter Singer has long argued that our treatment of factory-farmed animals constitutes just such an enormity; others point to the structural violence of global poverty or the existential risks we are generating through environmental destruction. The lesson of moral history may not be that progress is inevitable but that it requires deliberate effort — the cultivation of imaginative empathy, the willingness to interrogate the most basic assumptions of one's culture, and the courage to act on moral conclusions even when doing so is economically and socially costly.`,
        phonetic_highlights: [
          { word: 'perplexing', phonetic: '/pəˈpleksɪŋ/', tip: "Three syllables: 'pur-PLEK-sing'. Stress on 2nd." },
          { word: 'incomprehension', phonetic: '/ˌɪnˌkɒmprɪˈhenʃən/', tip: "Five syllables. Stress on 4th: 'in-kom-prih-HEN-shun'." },
          { word: 'relativist', phonetic: '/ˈrelətɪvɪst/', tip: "Four syllables: 'REL-uh-tiv-ist'. Stress on 1st." },
        ],
        key_phrases: [{ phrase: 'moral blind spots', meaning: 'ethical failures we cannot see because they are normalised in our culture' }, { phrase: 'directional tendency', meaning: 'an overall movement in a particular direction, even if not linear or guaranteed' }],
      },
      {
        title: 'Consciousness and the Hard Problem', topic: 'Neuroscience & Philosophy',
        text: `The "hard problem of consciousness," as David Chalmers famously named it, concerns not the neural correlates of perception or cognition — questions that neuroscience is progressively illuminating — but the far deeper puzzle of why any physical process should give rise to subjective experience at all. We can in principle conceive of a philosophical zombie that behaves exactly like a conscious human being — responding appropriately to stimuli, reporting the appropriate inner states — yet experiences nothing whatsoever from the inside. The fact that such a scenario is at least conceivable suggests, on Chalmers' account, that consciousness cannot be fully explained in purely physical terms. Physicalists counter that the conceivability of zombies does not establish their metaphysical possibility; the history of science contains phenomena that seemed irreducibly mysterious until the right conceptual framework emerged. Just as vitalism was dissolved by molecular biology, perhaps consciousness will eventually yield to a sufficiently sophisticated neuroscience. Panpsychists offer a third path, arguing that proto-conscious properties are fundamental features of the physical world, present even in simple matter, and that complex human experience represents an integration of these basic properties rather than their sudden emergence from inert substance. Each position carries implications that extend far beyond theoretical philosophy into questions of moral status, personal identity, and the boundaries of what we are entitled to treat as mere objects.`,
        phonetic_highlights: [
          { word: 'conceivable', phonetic: '/kənˈsiːvəbəl/', tip: "Four syllables: 'kun-SEE-vuh-bul'. Stress on 2nd." },
          { word: 'panpsychists', phonetic: '/ˈpænˌsaɪkɪsts/', tip: "Three syllables: 'PAN-sy-kists'. Stress on 1st." },
          { word: 'vitalism', phonetic: '/ˈvaɪtəlɪzəm/', tip: "Four syllables: 'VY-tuh-liz-um'. Stress on 1st." },
        ],
        key_phrases: [{ phrase: 'hard problem', meaning: 'a question that resists explanation even after all functional and behavioural questions are answered' }, { phrase: 'proto-conscious', meaning: 'possessing a primitive or basic form of consciousness or awareness' }],
      },
    ],
  };

  private readonly fallbackPromptsByLevel: Record<CefrLevel, any[]> = {
    A1: [
      { part: 1, topic: 'My Family', prep_time_seconds: 20, speak_time_seconds: 45, question: 'Tell me about your family. How many people are in your family? Do you have brothers or sisters?', bullet_points: ['how many people', 'brothers or sisters', 'what your parents do', 'who you are close to'], example_vocabulary: ['family', 'sister', 'brother', 'mother', 'father', 'together', 'love'] },
      { part: 1, topic: 'Your Home', prep_time_seconds: 20, speak_time_seconds: 45, question: 'Tell me about where you live. What is your home like? Do you have your own room?', bullet_points: ['type of home', 'your room', 'your neighbourhood', 'what you like about it'], example_vocabulary: ['house', 'apartment', 'bedroom', 'kitchen', 'garden', 'small', 'cosy'] },
      { part: 1, topic: 'Food You Like', prep_time_seconds: 20, speak_time_seconds: 45, question: 'What is your favourite food? Do you eat it every day? Who makes it for you?', bullet_points: ['your favourite food', 'how often you eat it', 'who cooks it', 'why you like it'], example_vocabulary: ['delicious', 'cook', 'favourite', 'taste', 'sweet', 'spicy', 'eat'] },
      { part: 2, topic: 'A Happy Day', prep_time_seconds: 60, speak_time_seconds: 90, question: 'Describe a happy day you remember. You should say: what you did, who was with you, where you went, and why you were happy.', bullet_points: ['what you did', 'who was with you', 'where you went', 'why you were happy'], example_vocabulary: ['happy', 'wonderful', 'excited', 'together', 'smile', 'fun', 'remember'] },
    ],
    A2: [
      { part: 1, topic: 'Your Hobbies', prep_time_seconds: 20, speak_time_seconds: 45, question: 'What do you like to do in your free time? How often do you do this? Who do you do it with?', bullet_points: ['your favourite hobby', 'how often you do it', 'who you do it with', 'why you enjoy it'], example_vocabulary: ['hobby', 'enjoy', 'spend time', 'free time', 'relax', 'practise', 'weekend'] },
      { part: 2, topic: 'A Happy Memory', prep_time_seconds: 60, speak_time_seconds: 120, question: 'Describe a happy memory from your childhood. You should say: what happened, who was there, where it was, and explain why you still remember it well.', bullet_points: ['what happened', 'who was there', 'where it was', 'why you remember it'], example_vocabulary: ['remember', 'happy', 'exciting', 'together', 'special', 'celebrate', 'laugh'] },
      { part: 1, topic: 'Your School', prep_time_seconds: 20, speak_time_seconds: 45, question: 'Tell me about your school. What is your favourite subject? What do you do at lunchtime?', bullet_points: ['what school is like', 'your favourite subject', 'lunchtime activities', 'your friends at school'], example_vocabulary: ['subject', 'lesson', 'classroom', 'break time', 'favourite', 'teacher', 'study'] },
      { part: 2, topic: 'A Place You Like', prep_time_seconds: 60, speak_time_seconds: 120, question: 'Describe a place you enjoy visiting. You should say: where it is, how you get there, what you do there, and explain why you like it.', bullet_points: ['where the place is', 'how you travel there', 'what you do there', 'why you enjoy it'], example_vocabulary: ['visit', 'beautiful', 'peaceful', 'exciting', 'travel', 'enjoy', 'favourite'] },
    ],
    B1: [
      { part: 2, topic: 'Memorable Trip', prep_time_seconds: 60, speak_time_seconds: 120, question: 'Describe a memorable trip or journey you have taken. You should say: where you went, who you went with, what you did there, and explain why it was memorable.', bullet_points: ['where you went', 'who went with you', 'what you did', 'why it was memorable'], example_vocabulary: ['destination', 'itinerary', 'breathtaking', 'adventurous', 'unforgettable', 'explore', 'memorable'] },
      { part: 1, topic: 'Technology Use', prep_time_seconds: 20, speak_time_seconds: 45, question: 'What piece of technology do you use most in your daily life? When did you start using it? Could you live without it?', bullet_points: ['what technology', 'when you started', 'how you use it', 'life without it'], example_vocabulary: ['smartphone', 'essential', 'daily life', 'rely on', 'convenient', 'communication', 'update'] },
      { part: 3, topic: 'Social Media', prep_time_seconds: 20, speak_time_seconds: 60, question: 'Do you think social media has mostly positive or negative effects on young people? What responsibilities do social media companies have towards their users?', bullet_points: ['positive effects', 'negative effects', 'company responsibility', 'future changes'], example_vocabulary: ['influence', 'mental health', 'addiction', 'privacy', 'regulation', 'interaction', 'platform'] },
      { part: 2, topic: 'A Person You Admire', prep_time_seconds: 60, speak_time_seconds: 120, question: 'Describe a person you admire. You should say: who they are, how you know them, what they have achieved, and explain why you admire them.', bullet_points: ['who they are', 'how you know them', 'what they have done', 'why you admire them'], example_vocabulary: ['admire', 'inspire', 'achieve', 'determine', 'talented', 'hardworking', 'role model'] },
      { part: 3, topic: 'Environmental Issues', prep_time_seconds: 20, speak_time_seconds: 60, question: 'What do you think is the biggest environmental problem today? Who is responsible for solving it — individuals or governments? What can ordinary people do?', bullet_points: ['the biggest problem', 'who is responsible', 'individual actions', 'government solutions'], example_vocabulary: ['pollution', 'climate change', 'renewable energy', 'responsibility', 'sustainable', 'carbon footprint', 'recycle'] },
    ],
    B2: [
      { part: 2, topic: 'An Influential Person', prep_time_seconds: 60, speak_time_seconds: 120, question: 'Describe someone who has had a significant influence on your life. You should say: who they are, how you know them, what they have done, and explain how they have shaped your thinking or decisions.', bullet_points: ['who they are', 'how you know them', 'what they did', 'how they influenced you'], example_vocabulary: ['inspire', 'admire', 'mentor', 'perspective', 'guidance', 'role model', 'transformative'] },
      { part: 3, topic: 'Environment & Policy', prep_time_seconds: 20, speak_time_seconds: 75, question: 'To what extent do you think individual actions can address climate change? Who bears greater responsibility — governments, corporations, or individuals? What policies would be most effective?', bullet_points: ['individual actions', 'corporate responsibility', 'government policy', 'effective solutions'], example_vocabulary: ['carbon footprint', 'systemic change', 'renewable energy', 'accountability', 'legislation', 'consumption', 'sustainability'] },
      { part: 3, topic: 'Work & Wellbeing', prep_time_seconds: 20, speak_time_seconds: 75, question: 'How has the nature of work changed in your lifetime? Do you think technology has improved or worsened work-life balance? What does an ideal working environment look like?', bullet_points: ['changes in work', 'technology impact', 'work-life balance', 'ideal environment'], example_vocabulary: ['remote work', 'automation', 'flexibility', 'burnout', 'productivity', 'collaboration', 'wellbeing'] },
      { part: 2, topic: 'A Cultural Experience', prep_time_seconds: 60, speak_time_seconds: 120, question: 'Describe a cultural event or experience that made a strong impression on you. You should say: what it was, where and when it happened, who you were with, and explain why it affected you.', bullet_points: ['what the experience was', 'where and when', 'who you were with', 'why it affected you'], example_vocabulary: ['tradition', 'ritual', 'cultural heritage', 'profound', 'perspective', 'meaningful', 'community'] },
      { part: 3, topic: 'Education Systems', prep_time_seconds: 20, speak_time_seconds: 75, question: 'In what ways do you think education systems need to change to prepare students for the future? Should universities focus more on practical skills or academic knowledge? How important is creativity in education?', bullet_points: ['needed changes', 'practical vs academic', 'creativity in education', 'future skills'], example_vocabulary: ['critical thinking', 'curriculum', 'vocational', 'innovation', 'adaptability', 'digital literacy', 'collaboration'] },
    ],
    C1: [
      { part: 3, topic: 'AI & Employment', prep_time_seconds: 20, speak_time_seconds: 75, question: 'To what extent do you think artificial intelligence will transform the labour market over the next two decades? How should educational systems adapt, and what social policies could mitigate negative impacts?', bullet_points: ['AI impact on jobs', 'skills for the future', 'educational reform', 'social safety nets'], example_vocabulary: ['automation', 'reskilling', 'structural unemployment', 'cognitive tasks', 'social contract', 'disruption', 'adaptability'] },
      { part: 2, topic: 'An Ethical Dilemma', prep_time_seconds: 60, speak_time_seconds: 120, question: 'Describe a time when you faced a difficult ethical or moral dilemma. You should say: what the situation was, what options you had, what decision you made, and explain how the experience affected your values.', bullet_points: ['the situation', 'options you had', 'decision you made', 'impact on your values'], example_vocabulary: ['dilemma', 'moral obligation', 'consequence', 'integrity', 'conflicting', 'reflection', 'principle'] },
      { part: 3, topic: 'Media & Truth', prep_time_seconds: 20, speak_time_seconds: 75, question: 'In an era of widespread misinformation, what is the responsibility of the media to inform the public truthfully? Is it possible to have genuinely objective journalism, and if not, how should audiences navigate information critically?', bullet_points: ['media responsibility', 'objectivity in journalism', 'misinformation effects', 'critical media literacy'], example_vocabulary: ['misinformation', 'editorial bias', 'fact-checking', 'epistemic trust', 'narrative framing', 'disinformation', 'media literacy'] },
      { part: 3, topic: 'Economic Inequality', prep_time_seconds: 20, speak_time_seconds: 75, question: 'Do you think economic inequality is inevitable in a market economy? What are the most damaging effects of inequality on society? Which policy approaches do you consider most effective in addressing it?', bullet_points: ['inevitability of inequality', 'social effects', 'effective policies', 'trade-offs'], example_vocabulary: ['redistribution', 'social mobility', 'systemic barriers', 'progressive taxation', 'meritocracy', 'structural disadvantage', 'equity'] },
      { part: 3, topic: 'Privacy & Technology', prep_time_seconds: 20, speak_time_seconds: 75, question: 'To what extent should individuals sacrifice privacy in exchange for digital services and national security? Who should have the power to set the boundaries of surveillance in a democratic society?', bullet_points: ['privacy vs security trade-off', 'corporate data collection', 'government surveillance', 'regulatory solutions'], example_vocabulary: ['surveillance', 'data sovereignty', 'algorithmic profiling', 'informed consent', 'regulatory framework', 'digital rights', 'accountability'] },
    ],
    C2: [
      { part: 3, topic: 'Freedom & Determinism', prep_time_seconds: 20, speak_time_seconds: 90, question: 'If advances in neuroscience demonstrate that all human decisions are determined by prior brain states, what are the implications for concepts of moral responsibility and legal culpability? Can the notion of "deserved punishment" survive a thoroughgoing determinism?', bullet_points: ['neuroscience and free will', 'moral responsibility', 'legal implications', 'philosophical response'], example_vocabulary: ['determinism', 'compatibilism', 'culpability', 'epiphenomenon', 'agency', 'retributive justice', 'phenomenology'] },
      { part: 3, topic: 'Language & Reality', prep_time_seconds: 20, speak_time_seconds: 90, question: 'To what extent does the language we speak shape the way we perceive and conceptualise reality? Does the Sapir-Whorf hypothesis have meaningful implications for cross-cultural understanding, or does it overstate linguistic determinism?', bullet_points: ['linguistic relativity', 'Sapir-Whorf hypothesis', 'cross-cultural implications', 'limits of the theory'], example_vocabulary: ['linguistic relativity', 'conceptual categories', 'Weltanschauung', 'cognitive constraints', 'universalism', 'ethnolinguistics', 'metalinguistic awareness'] },
      { part: 3, topic: 'Scientific Knowledge', prep_time_seconds: 20, speak_time_seconds: 90, question: 'Is the concept of objective scientific truth defensible, or is all scientific knowledge inevitably shaped by the social, political, and cultural contexts in which it is produced? How should policy-makers navigate disagreements between scientific consensus and democratic accountability?', bullet_points: ['scientific objectivity', 'sociology of knowledge', 'paradigms and power', 'policy implications'], example_vocabulary: ['falsifiability', 'paradigm shift', 'epistemic community', 'value-laden', 'replication crisis', 'post-positivism', 'technocracy'] },
      { part: 3, topic: 'Moral Progress', prep_time_seconds: 20, speak_time_seconds: 90, question: 'Is there a coherent sense in which humanity has made genuine moral progress, or are different ethical systems simply incommensurable? What would it mean to say that a past civilisation was morally inferior to our own, and does this judgment carry any philosophical weight?', bullet_points: ['evidence for moral progress', 'relativism vs universalism', 'judging historical ethics', 'criteria for moral progress'], example_vocabulary: ['moral realism', 'incommensurability', 'normative standards', 'historical contingency', 'expanding moral circle', 'ethical universalism', 'anachronistic judgment'] },
      { part: 3, topic: 'Consciousness & Identity', prep_time_seconds: 20, speak_time_seconds: 90, question: 'If a perfect digital copy of your brain were created and your biological body destroyed, would the copy be "you"? What does your answer reveal about the relationship between consciousness, personal identity, and physical continuity?', bullet_points: ['personal identity criteria', 'psychological vs physical continuity', 'implications of mind uploading', 'philosophical conclusions'], example_vocabulary: ['personal identity', 'continuity of consciousness', 'substrate independence', 'Parfitian reductionism', 'teleportation paradox', 'animalism', 'psychological connectedness'] },
    ],
  };

  private fallbackExercise(level: CefrLevel) {
    const pool = this.fallbackExercises[level];
    const last = this.lastExIdx.get(level) ?? -1;
    const { item: ex, idx } = this.pickRandom(pool, last);
    this.lastExIdx.set(level, idx);
    return { id: `sp_fallback_${Date.now()}`, level, ...ex, difficulty_notes: `Focus on natural rhythm, stress, and intonation appropriate for ${level} level.` };
  }

  private fallbackSpeakingPrompt(level: CefrLevel) {
    const pool = this.fallbackPromptsByLevel[level];
    const last = this.lastPrIdx.get(level) ?? -1;
    const { item: p, idx } = this.pickRandom(pool, last);
    this.lastPrIdx.set(level, idx);
    return { id: `spq_fallback_${Date.now()}`, level, ...p };
  }

  private fallbackEvaluation(dto: EvaluateSpeakingDto) {
    return {
      overall_score: 70, pronunciation_score: 68, fluency_score: 72, accuracy_score: 70,
      word_errors: [], missed_words: [], extra_words: [],
      strengths: ['Attempted the full passage', 'Basic sentence rhythm maintained', 'Clear effort to reproduce content'],
      improvements: ['Focus on stressed syllables in longer words', 'Record yourself and compare to a native speaker', 'Practise the phonetic highlights at slow speed first'],
      phonetic_tips: [{ sound: '/θ/', tip: 'Place the tip of your tongue lightly between your teeth for "th" sounds' }],
      overall_feedback: 'AI evaluation is temporarily unavailable. Keep practising by shadowing the text at slow speed, then gradually increasing until you match the natural rhythm. Focus especially on the phonetic highlights provided.',
    };
  }
}
