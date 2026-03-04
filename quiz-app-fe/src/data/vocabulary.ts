export interface VocabWord {
  id: number
  category: 'animals' | 'colors' | 'food' | 'family' | 'nature' | 'numbers' | 'daily'
  en: string
  vi: string
  zh: string
  ja: string
}

export const vocabulary: VocabWord[] = [
  // Animals (10)
  { id: 1,  category: 'animals', en: 'cat',      vi: 'con mèo',      zh: '猫 (māo)',       ja: '猫 (ねこ)' },
  { id: 2,  category: 'animals', en: 'dog',      vi: 'con chó',      zh: '狗 (gǒu)',       ja: '犬 (いぬ)' },
  { id: 3,  category: 'animals', en: 'bird',     vi: 'con chim',     zh: '鸟 (niǎo)',      ja: '鳥 (とり)' },
  { id: 4,  category: 'animals', en: 'fish',     vi: 'con cá',       zh: '鱼 (yú)',        ja: '魚 (さかな)' },
  { id: 5,  category: 'animals', en: 'horse',    vi: 'con ngựa',     zh: '马 (mǎ)',        ja: '馬 (うま)' },
  { id: 6,  category: 'animals', en: 'rabbit',   vi: 'con thỏ',      zh: '兔子 (tùzi)',    ja: 'うさぎ' },
  { id: 7,  category: 'animals', en: 'tiger',    vi: 'con hổ',       zh: '老虎 (lǎohǔ)',   ja: 'トラ' },
  { id: 8,  category: 'animals', en: 'elephant', vi: 'con voi',      zh: '大象 (dàxiàng)', ja: 'ゾウ' },
  { id: 9,  category: 'animals', en: 'lion',     vi: 'con sư tử',    zh: '狮子 (shīzi)',   ja: 'ライオン' },
  { id: 10, category: 'animals', en: 'monkey',   vi: 'con khỉ',      zh: '猴子 (hóuzi)',   ja: 'サル' },

  // Colors (8)
  { id: 11, category: 'colors', en: 'red',    vi: 'màu đỏ',    zh: '红色 (hóngsè)',  ja: '赤 (あか)' },
  { id: 12, category: 'colors', en: 'blue',   vi: 'màu xanh',  zh: '蓝色 (lánsè)',   ja: '青 (あお)' },
  { id: 13, category: 'colors', en: 'green',  vi: 'màu lá',    zh: '绿色 (lǜsè)',    ja: '緑 (みどり)' },
  { id: 14, category: 'colors', en: 'yellow', vi: 'màu vàng',  zh: '黄色 (huángsè)', ja: '黄色 (きいろ)' },
  { id: 15, category: 'colors', en: 'white',  vi: 'màu trắng', zh: '白色 (báisè)',   ja: '白 (しろ)' },
  { id: 16, category: 'colors', en: 'black',  vi: 'màu đen',   zh: '黑色 (hēisè)',   ja: '黒 (くろ)' },
  { id: 17, category: 'colors', en: 'purple', vi: 'màu tím',   zh: '紫色 (zǐsè)',    ja: '紫 (むらさき)' },
  { id: 18, category: 'colors', en: 'orange', vi: 'màu cam',   zh: '橙色 (chéngsè)', ja: 'オレンジ' },

  // Food (10)
  { id: 19, category: 'food', en: 'rice',    vi: 'cơm',        zh: '米饭 (mǐfàn)',     ja: 'ご飯 (ごはん)' },
  { id: 20, category: 'food', en: 'bread',   vi: 'bánh mì',    zh: '面包 (miànbāo)',   ja: 'パン' },
  { id: 21, category: 'food', en: 'water',   vi: 'nước',       zh: '水 (shuǐ)',        ja: '水 (みず)' },
  { id: 22, category: 'food', en: 'milk',    vi: 'sữa',        zh: '牛奶 (niúnǎi)',    ja: 'ミルク' },
  { id: 23, category: 'food', en: 'apple',   vi: 'táo',        zh: '苹果 (píngguǒ)',   ja: 'りんご' },
  { id: 24, category: 'food', en: 'banana',  vi: 'chuối',      zh: '香蕉 (xiāngjiāo)', ja: 'バナナ' },
  { id: 25, category: 'food', en: 'egg',     vi: 'trứng',      zh: '鸡蛋 (jīdàn)',     ja: '卵 (たまご)' },
  { id: 26, category: 'food', en: 'chicken', vi: 'gà',         zh: '鸡 (jī)',           ja: '鶏 (にわとり)' },
  { id: 27, category: 'food', en: 'noodle',  vi: 'mì',         zh: '面条 (miàntiáo)',   ja: '麺 (めん)' },
  { id: 28, category: 'food', en: 'soup',    vi: 'canh',       zh: '汤 (tāng)',         ja: 'スープ' },

  // Family (7)
  { id: 29, category: 'family', en: 'mother',      vi: 'mẹ',     zh: '妈妈 (māma)',    ja: 'お母さん (おかあさん)' },
  { id: 30, category: 'family', en: 'father',      vi: 'bố',     zh: '爸爸 (bàba)',    ja: 'お父さん (おとうさん)' },
  { id: 31, category: 'family', en: 'sister',      vi: 'chị',    zh: '姐姐 (jiějie)',  ja: '姉 (あね)' },
  { id: 32, category: 'family', en: 'brother',     vi: 'anh',    zh: '哥哥 (gēge)',    ja: '兄 (あに)' },
  { id: 33, category: 'family', en: 'grandmother', vi: 'bà',     zh: '奶奶 (nǎinai)',  ja: 'おばあさん' },
  { id: 34, category: 'family', en: 'grandfather', vi: 'ông',    zh: '爷爷 (yéye)',    ja: 'おじいさん' },
  { id: 35, category: 'family', en: 'friend',      vi: 'bạn bè', zh: '朋友 (péngyou)', ja: '友達 (ともだち)' },

  // Nature (8)
  { id: 36, category: 'nature', en: 'sun',      vi: 'mặt trời', zh: '太阳 (tàiyáng)', ja: '太陽 (たいよう)' },
  { id: 37, category: 'nature', en: 'moon',     vi: 'mặt trăng',zh: '月亮 (yuèliàng)',ja: '月 (つき)' },
  { id: 38, category: 'nature', en: 'rain',     vi: 'mưa',      zh: '雨 (yǔ)',         ja: '雨 (あめ)' },
  { id: 39, category: 'nature', en: 'tree',     vi: 'cây',      zh: '树 (shù)',        ja: '木 (き)' },
  { id: 40, category: 'nature', en: 'flower',   vi: 'hoa',      zh: '花 (huā)',        ja: '花 (はな)' },
  { id: 41, category: 'nature', en: 'river',    vi: 'sông',     zh: '河流 (héliú)',    ja: '川 (かわ)' },
  { id: 42, category: 'nature', en: 'mountain', vi: 'núi',      zh: '山 (shān)',       ja: '山 (やま)' },
  { id: 43, category: 'nature', en: 'sky',      vi: 'bầu trời', zh: '天空 (tiānkōng)', ja: '空 (そら)' },

  // Numbers (7)
  { id: 44, category: 'numbers', en: 'one',     vi: 'một',     zh: '一 (yī)',    ja: '一 (いち)' },
  { id: 45, category: 'numbers', en: 'two',     vi: 'hai',     zh: '二 (èr)',    ja: '二 (に)' },
  { id: 46, category: 'numbers', en: 'three',   vi: 'ba',      zh: '三 (sān)',   ja: '三 (さん)' },
  { id: 47, category: 'numbers', en: 'four',    vi: 'bốn',     zh: '四 (sì)',    ja: '四 (し)' },
  { id: 48, category: 'numbers', en: 'five',    vi: 'năm',     zh: '五 (wǔ)',    ja: '五 (ご)' },
  { id: 49, category: 'numbers', en: 'ten',     vi: 'mười',    zh: '十 (shí)',   ja: '十 (じゅう)' },
  { id: 50, category: 'numbers', en: 'hundred', vi: 'một trăm',zh: '百 (bǎi)',   ja: '百 (ひゃく)' },
]

export function getWordInLang(word: VocabWord, lang: string): string {
  return (word as Record<string, string>)[lang] ?? word.en
}
