import type { WritingType } from './modules/skills/dto/skills.dto';

export interface WritingPrompt {
  id: string;
  type: WritingType;
  title: string;
  prompt: string;
  context: string;
  time_limit_seconds: number;
  word_target: string;
  band_criteria: string[];
  tips: string[];
  image_key?: string;
}

export const WRITING_PROMPTS: Record<WritingType, WritingPrompt[]> = {
  ielts_task1: [
    {
      id: 'ielts_task1_001',
      type: 'ielts_task1',
      title: 'Online Shopping Growth Trends',
      prompt: 'The graph below shows the percentage of people who shopped online in four countries between 2010 and 2023. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.',
      context: 'A line graph displaying online shopping adoption rates (%) for United Kingdom, United States, Japan, and Brazil from 2010 to 2023, showing trends over the 13-year period.',
      time_limit_seconds: 1200,
      word_target: '150 words minimum',
      band_criteria: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
      tips: [
        'Begin with an overview statement summarizing the main trend before providing details',
        'Use data presentation language: "approximately", "roughly", "around", "at least"',
        'Compare countries at key points in time (2010, 2015, 2023) and identify the highest and lowest performers'
      ],
      image_key: 'line-graph-shopping'
    },
    {
      id: 'ielts_task1_002',
      type: 'ielts_task1',
      title: 'Energy Consumption by Source',
      prompt: 'The pie chart below illustrates the proportion of energy consumed from different sources in a developed nation over a five-year period. Summarise the key information and report the main differences.',
      context: 'A pie chart showing the distribution of energy sources: fossil fuels (45%), renewable energy (30%), nuclear power (15%), and other sources (10%), with comparative data from three years.',
      time_limit_seconds: 1200,
      word_target: '150 words minimum',
      band_criteria: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
      tips: [
        'Describe the overall composition first, identifying the dominant sources',
        'Use comparative language: "more than", "less than", "significantly", "slightly"',
        'Convert percentages to trends and highlight any notable changes between the time periods'
      ],
      image_key: 'pie-chart-energy'
    },
    {
      id: 'ielts_task1_003',
      type: 'ielts_task1',
      title: 'Mobile Device Usage by Age Group',
      prompt: 'The bar chart below shows the percentage of different age groups using various mobile devices in 2023. Describe the information by selecting the most significant features and make relevant comparisons.',
      context: 'A grouped bar chart comparing smartphone, tablet, and smartwatch usage across five age groups (13-17, 18-29, 30-45, 46-60, 60+), with percentages on the vertical axis.',
      time_limit_seconds: 1200,
      word_target: '150 words minimum',
      band_criteria: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
      tips: [
        'Start with a general statement about the overall pattern of device usage across age groups',
        'Use language for comparisons: "in contrast", "similarly", "whereas", "compared to"',
        'Focus on the most dramatic differences and identify which age group dominates in each device category'
      ],
      image_key: 'bar-chart-devices'
    },
    {
      id: 'ielts_task1_004',
      type: 'ielts_task1',
      title: 'University Enrollment Statistics',
      prompt: 'The table below presents enrollment numbers for different degree programs at a university from 2018 to 2023. Summarise the information and highlight the most important trends.',
      context: 'A table showing student enrollment numbers for five degree programs (Engineering, Business, Medicine, Arts, Sciences) across six academic years, with data for both domestic and international students.',
      time_limit_seconds: 1200,
      word_target: '150 words minimum',
      band_criteria: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
      tips: [
        'Identify the overall trend: which programs are growing, declining, or remaining stable',
        'Compare enrollment figures at the beginning, middle, and end of the period',
        'Highlight any significant differences between domestic and international student populations'
      ],
      image_key: 'table-enrollment'
    },
    {
      id: 'ielts_task1_005',
      type: 'ielts_task1',
      title: 'Public Transportation Usage in City Centers',
      prompt: 'The diagram below shows the main transportation modes used by commuters in five major city centers during peak hours. Describe the distribution and explain the key features.',
      context: 'A stacked bar chart illustrating the proportion of commuters using buses, trains, bicycles, cars, and walking in London, Tokyo, New York, Singapore, and Amsterdam.',
      time_limit_seconds: 1200,
      word_target: '150 words minimum',
      band_criteria: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
      tips: [
        'Begin with an overview statement comparing transportation preferences across the five cities',
        'Group cities with similar patterns together and identify outliers',
        'Use percentages and proportional language to describe the composition of each city\'s transportation mix'
      ],
      image_key: 'stacked-bar-transport'
    },
    {
      id: 'ielts_task1_006',
      type: 'ielts_task1',
      title: 'Population Age Distribution',
      prompt: 'The population pyramid below compares the age distribution of males and females in a developed country and a developing country. Summarise the key features and make relevant comparisons.',
      context: 'Two side-by-side population pyramids showing age groups (0-4, 5-9... 75+) for males and females in a developed nation with an aging population and a developing nation with a younger population.',
      time_limit_seconds: 1200,
      word_target: '150 words minimum',
      band_criteria: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
      tips: [
        'Describe the overall shape of each pyramid and explain what it reveals about population structure',
        'Compare age group distributions between the two countries and identify significant differences',
        'Explain the demographic implications of each structure (aging vs. young population)'
      ],
      image_key: 'pyramid-population'
    }
  ],

  ielts_task2: [
    {
      id: 'ielts_task2_001',
      type: 'ielts_task2',
      title: 'Technology and Human Connection',
      prompt: 'Some people believe that modern technology has made it easier for people to connect with others. Others argue that technology has actually made people more isolated and disconnected from face-to-face interactions. Discuss both viewpoints and give your own opinion.',
      context: 'In recent years, smartphones, social media, and instant messaging platforms have transformed how people communicate globally, raising debates about the quality and authenticity of modern relationships.',
      time_limit_seconds: 2400,
      word_target: '250 words minimum',
      band_criteria: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
      tips: [
        'Acknowledge both perspectives with specific examples before presenting your position',
        'Use cohesive devices: "However", "On the other hand", "Furthermore", "Moreover"',
        'Structure your response with clear paragraphs: Introduction, Viewpoint 1, Viewpoint 2, Your Opinion, Conclusion'
      ]
    },
    {
      id: 'ielts_task2_002',
      type: 'ielts_task2',
      title: 'Environmental Sustainability Challenges',
      prompt: 'Environmental protection requires sacrifices from individuals and businesses, including higher costs for sustainable products and reduced consumption. Some argue this burden is necessary, while others believe governments and corporations should bear most of the responsibility. To what extent do you agree or disagree?',
      context: 'Climate change, pollution, and resource depletion are pressing global issues. The debate centers on whether responsibility lies with individual consumers or large-scale institutional actors.',
      time_limit_seconds: 2400,
      word_target: '250 words minimum',
      band_criteria: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
      tips: [
        'Present a clear stance and maintain it throughout the essay',
        'Support arguments with concrete examples: renewable energy projects, corporate sustainability programs, consumer choices',
        'Use varied sentence structures to demonstrate grammatical range and avoid repetition'
      ]
    },
    {
      id: 'ielts_task2_003',
      type: 'ielts_task2',
      title: 'Remote Work and Work-Life Balance',
      prompt: 'The shift to remote work has increased flexibility for employees, allowing them to balance professional and personal responsibilities. However, it has also blurred the boundaries between work and home life, leading to longer working hours and burnout. Discuss the advantages and disadvantages of remote work.',
      context: 'The global pandemic accelerated the adoption of remote work arrangements. While many workers appreciate the flexibility, concerns about overwork and isolation have emerged.',
      time_limit_seconds: 2400,
      word_target: '250 words minimum',
      band_criteria: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
      tips: [
        'Use topic-specific vocabulary: "commute", "productivity", "boundary setting", "work-life integration"',
        'Provide balanced discussion by allocating similar space to advantages and disadvantages',
        'Include practical examples that illustrate your points clearly'
      ]
    },
    {
      id: 'ielts_task2_004',
      type: 'ielts_task2',
      title: 'Education and Technological Innovation',
      prompt: 'Technology is rapidly changing education through online learning platforms, artificial intelligence tutors, and virtual classrooms. Some educators support this transformation as it increases accessibility and personalization. Others worry it will devalue human teaching and social learning. What is your opinion?',
      context: 'Educational technology has evolved dramatically, offering new opportunities and challenges. The debate involves questions of equity, pedagogy, and the role of teachers in a digital age.',
      time_limit_seconds: 2400,
      word_target: '250 words minimum',
      band_criteria: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
      tips: [
        'Use academic vocabulary appropriately: "facilitates", "encompasses", "exacerbates", "mitigates"',
        'Address counterarguments and explain why your position is stronger',
        'Conclude with a forward-looking statement about the future of education'
      ]
    },
    {
      id: 'ielts_task2_005',
      type: 'ielts_task2',
      title: 'Social Media and Mental Health',
      prompt: 'Social media platforms have become central to modern life, enabling connection and self-expression. Yet, they have also been linked to increased anxiety, depression, and social comparison. Some propose stricter regulation, while others advocate for digital literacy. How should society address the negative impacts of social media?',
      context: 'Mental health professionals have raised concerns about social media\'s psychological effects, particularly among young people. Different stakeholders propose varied solutions.',
      time_limit_seconds: 2400,
      word_target: '250 words minimum',
      band_criteria: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
      tips: [
        'Acknowledge the benefits of social media before discussing drawbacks',
        'Compare and evaluate different solutions: regulation, literacy education, platform design changes',
        'Use evidence-based reasoning rather than sweeping generalizations'
      ]
    },
    {
      id: 'ielts_task2_006',
      type: 'ielts_task2',
      title: 'Economic Growth Versus Environmental Protection',
      prompt: 'Many countries must choose between rapid economic development and environmental conservation. Some argue that growth takes priority, particularly in developing nations, as it reduces poverty and improves living standards. Others insist that environmental protection must not be compromised. Discuss both perspectives and provide your view.',
      context: 'Industrializing nations face pressure to develop economically while facing pressure from developed nations to adopt environmental standards that may slow growth.',
      time_limit_seconds: 2400,
      word_target: '250 words minimum',
      band_criteria: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
      tips: [
        'Consider the perspective of developing versus developed nations',
        'Discuss concepts like sustainable development as a potential reconciliation',
        'Use examples of countries that have achieved both goals or faced consequences of prioritizing one over the other'
      ]
    }
  ],

  toeic: [
    {
      id: 'toeic_001',
      type: 'toeic',
      title: 'Work-From-Home Policy Decision',
      prompt: 'Your company is considering implementing a permanent work-from-home policy for all departments. Write an email to your manager sharing your opinion on this decision and explaining how it would affect your productivity, work relationships, and personal situation.',
      context: 'You work at a mid-sized marketing firm with teams spread across three office locations. Your manager has requested employee feedback before the board meeting next Friday to inform the final decision.',
      time_limit_seconds: 1800,
      word_target: '100-200 words',
      band_criteria: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
      tips: [
        'Use formal email structure: subject line, greeting, clear paragraphs, professional closing',
        'State your position clearly in the opening and support it with 2-3 specific reasons',
        'Address potential concerns your manager might have and provide solutions where possible'
      ]
    },
    {
      id: 'toeic_002',
      type: 'toeic',
      title: 'New Office Location Selection',
      prompt: 'Your company is relocating its main office to one of three potential locations. As a team lead, you\'ve been asked to submit a brief report recommending the best location and justifying your choice based on costs, accessibility, and employee satisfaction.',
      context: 'The three locations are: (1) City center, expensive but excellent public transport; (2) Suburban area, 40% cheaper but requires car travel; (3) Tech park, moderate cost but limited dining and entertainment options nearby.',
      time_limit_seconds: 1800,
      word_target: '100-200 words',
      band_criteria: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
      tips: [
        'Present your recommendation early and structure arguments logically',
        'Use data and specific details to support your decision',
        'Acknowledge trade-offs and demonstrate balanced thinking'
      ]
    },
    {
      id: 'toeic_003',
      type: 'toeic',
      title: 'Training Program Feedback Request',
      prompt: 'Write an email to the Human Resources department responding to their request for employee feedback on the recently completed professional development training program. Include what aspects were effective, what could be improved, and suggest at least one recommendation for future programs.',
      context: 'Your company just completed a mandatory three-day training program on customer service excellence. The HR department is collecting feedback from all employees to evaluate the program\'s effectiveness and plan future training.',
      time_limit_seconds: 1800,
      word_target: '100-200 words',
      band_criteria: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
      tips: [
        'Balance positive and constructive feedback to appear credible and professional',
        'Provide specific examples of what worked well and what didn\'t',
        'Offer forward-looking suggestions rather than just criticisms'
      ]
    },
    {
      id: 'toeic_004',
      type: 'toeic',
      title: 'Project Deadline Extension Request',
      prompt: 'Write an email to your project manager explaining that your team needs an additional two weeks to complete a major client project. Justify the request, explain what has caused the delay, and propose a realistic new timeline with deliverables.',
      context: 'Your team is working on a web application project with an original deadline of next Friday. Unexpected technical challenges and staff absence have impacted progress. The client is important for future business.',
      time_limit_seconds: 1800,
      word_target: '100-200 words',
      band_criteria: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
      tips: [
        'Take responsibility and avoid making excuses sound irresponsible',
        'Provide specific reasons and concrete timelines',
        'Offer solutions to minimize impact on the client and company'
      ]
    },
    {
      id: 'toeic_005',
      type: 'toeic',
      title: 'Client Communication Issue Resolution',
      prompt: 'A major client has complained that your team has been slow to respond to their requests and that communication has been unclear. Write an email to the client acknowledging their concerns, explaining what went wrong, and outlining specific steps you will take to improve communication and service going forward.',
      context: 'The client has been a loyal customer for five years but is considering taking their business elsewhere. Your company depends on maintaining this relationship. You have the authority to make improvements to the service level.',
      time_limit_seconds: 1800,
      word_target: '100-200 words',
      band_criteria: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
      tips: [
        'Open with genuine apology and take responsibility without over-explaining',
        'Be specific about what will change: designated contact person, response time targets, regular check-ins',
        'Close with reassurance about the value of the relationship'
      ]
    },
    {
      id: 'toeic_006',
      type: 'toeic',
      title: 'Budget Allocation Proposal',
      prompt: 'Your department\'s budget for the next fiscal year has been reduced by 15%. Write a proposal to your finance director requesting budget allocation for three key initiatives. Explain why each initiative is important for business objectives and how the reduced budget can be effectively distributed.',
      context: 'You manage a 10-person team with needs in three areas: (1) Software licensing ($40K), (2) Professional development ($15K), (3) Equipment upgrades ($25K). Total needed is $80K but only $68K is available.',
      time_limit_seconds: 1800,
      word_target: '100-200 words',
      band_criteria: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
      tips: [
        'Prioritize initiatives based on business impact and clearly explain the rationale',
        'Show realistic cost management and creative solutions to stay within budget constraints',
        'Connect budget requests to measurable outcomes and return on investment'
      ]
    }
  ],

  general: [
    {
      id: 'general_001',
      type: 'general',
      title: 'A Place That Shaped You',
      prompt: 'Write about a place that has had a significant impact on your life. Describe the place in detail, explain why it is meaningful to you, and reflect on how it has influenced your character or perspectives.',
      context: 'This could be a place from your childhood, somewhere you have traveled, a place where important events occurred, or a location you visit regularly. Consider sensory details and emotional connections.',
      time_limit_seconds: 1500,
      word_target: '150-250 words',
      band_criteria: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
      tips: [
        'Use vivid sensory language to help readers visualize and connect with the place',
        'Structure: Introduction (place + significance) → Physical description → Emotional meaning → Personal impact',
        'Employ past and present tenses appropriately to contrast memories with current understanding'
      ]
    },
    {
      id: 'general_002',
      type: 'general',
      title: 'A Person Who Influenced You',
      prompt: 'Describe a person who has had a meaningful influence on your life. Explain who they are, what they taught you or how they changed your perspective, and discuss the lasting impact they have had on you.',
      context: 'This could be a family member, teacher, mentor, friend, or even someone you admire from a distance. Consider their qualities, your relationship with them, and specific moments that stand out.',
      time_limit_seconds: 1500,
      word_target: '150-250 words',
      band_criteria: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
      tips: [
        'Bring the person to life with specific examples and anecdotes rather than general statements',
        'Show the relationship between their actions and your personal development',
        'Reflect on both what they taught you and who they helped you become'
      ]
    },
    {
      id: 'general_003',
      type: 'general',
      title: 'A Skill You Developed',
      prompt: 'Write about a skill you have learned and how you developed it. Explain why you decided to learn this skill, describe the learning process, discuss challenges you faced, and reflect on how this skill has benefited your life.',
      context: 'This could be a practical skill (cooking, language, music, sports), professional skill (coding, writing, public speaking), or personal skill (time management, patience, emotional intelligence).',
      time_limit_seconds: 1500,
      word_target: '150-250 words',
      band_criteria: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
      tips: [
        'Include concrete examples of how you practice or use this skill',
        'Honestly discuss obstacles and setbacks, showing growth through perseverance',
        'Connect the skill development to broader personal or professional goals'
      ]
    },
    {
      id: 'general_004',
      type: 'general',
      title: 'A Cultural Tradition That Matters',
      prompt: 'Describe a cultural tradition that is important to you or your community. Explain the origins and significance of this tradition, how it is celebrated, and what role it plays in preserving cultural identity and values.',
      context: 'This could be a holiday, ceremony, festival, ritual, or custom from your family, ethnic background, or local community. Consider its history, the values it represents, and its modern practice.',
      time_limit_seconds: 1500,
      word_target: '150-250 words',
      band_criteria: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
      tips: [
        'Use descriptive language to capture the sensory and emotional aspects of the tradition',
        'Explain both the historical/spiritual significance and the contemporary relevance',
        'Include personal perspective on why this tradition matters to you individually'
      ]
    },
    {
      id: 'general_005',
      type: 'general',
      title: 'Overcoming a Challenge',
      prompt: 'Write about a significant challenge or difficulty you have faced. Describe the challenge clearly, explain how you dealt with it, what you learned from the experience, and how it changed you.',
      context: 'This could be an academic struggle, personal loss, relationship difficulty, health issue, financial problem, or any situation where you had to overcome adversity. Focus on your agency and growth.',
      time_limit_seconds: 1500,
      word_target: '150-250 words',
      band_criteria: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
      tips: [
        'Be honest about the difficulty without seeking pity; focus on your response and resilience',
        'Explain the strategies or support systems that helped you overcome the challenge',
        'Reflect on how the experience changed your perspective or made you stronger'
      ]
    },
    {
      id: 'general_006',
      type: 'general',
      title: 'Your Future Aspirations',
      prompt: 'Write about goals or aspirations you have for your future. Describe what you hope to achieve, why these goals are important to you, what steps you are taking to reach them, and how achieving them would change your life.',
      context: 'Consider your personal, professional, educational, or lifestyle aspirations. Think about both short-term goals (next few years) and long-term dreams, and the motivation behind them.',
      time_limit_seconds: 1500,
      word_target: '150-250 words',
      band_criteria: ['Task Achievement', 'Coherence & Cohesion', 'Lexical Resource', 'Grammatical Range & Accuracy'],
      tips: [
        'Be specific and realistic about your goals; avoid vague or overly general aspirations',
        'Demonstrate self-awareness about why these goals matter and what drives you',
        'Show concrete action steps and realistic planning, not just dreams'
      ]
    }
  ]
};
