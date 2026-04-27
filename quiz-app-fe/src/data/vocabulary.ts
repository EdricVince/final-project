export interface VocabWord {
  id: number
  category: 'animals' | 'colors' | 'food' | 'family' | 'nature' | 'numbers' | 'daily' | 'body' | 'adjectives' | 'verbs' | 'transport' | 'clothes'
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

  // Body Parts (10)
  { id: 51, category: 'body', en: 'head',   vi: 'đầu',    zh: '头 (tóu)',     ja: '頭 (あたま)' },
  { id: 52, category: 'body', en: 'eye',    vi: 'mắt',    zh: '眼睛 (yǎnjīng)',ja: '目 (め)' },
  { id: 53, category: 'body', en: 'ear',    vi: 'tai',    zh: '耳朵 (ěrduǒ)', ja: '耳 (みみ)' },
  { id: 54, category: 'body', en: 'nose',   vi: 'mũi',    zh: '鼻子 (bízi)',  ja: '鼻 (はな)' },
  { id: 55, category: 'body', en: 'mouth',  vi: 'miệng',  zh: '嘴巴 (zuǐba)', ja: '口 (くち)' },
  { id: 56, category: 'body', en: 'hand',   vi: 'tay',    zh: '手 (shǒu)',    ja: '手 (て)' },
  { id: 57, category: 'body', en: 'foot',   vi: 'chân',   zh: '脚 (jiǎo)',    ja: '足 (あし)' },
  { id: 58, category: 'body', en: 'arm',    vi: 'cánh tay',zh: '手臂 (shǒubì)',ja: '腕 (うで)' },
  { id: 59, category: 'body', en: 'hair',   vi: 'tóc',    zh: '头发 (tóufa)', ja: '髪 (かみ)' },
  { id: 60, category: 'body', en: 'heart',  vi: 'tim',    zh: '心脏 (xīnzàng)',ja: '心臓 (しんぞう)' },

  // Adjectives (12)
  { id: 61, category: 'adjectives', en: 'big',      vi: 'to lớn',    zh: '大 (dà)',      ja: '大きい (おおきい)' },
  { id: 62, category: 'adjectives', en: 'small',    vi: 'nhỏ',       zh: '小 (xiǎo)',    ja: '小さい (ちいさい)' },
  { id: 63, category: 'adjectives', en: 'fast',     vi: 'nhanh',     zh: '快 (kuài)',    ja: '速い (はやい)' },
  { id: 64, category: 'adjectives', en: 'slow',     vi: 'chậm',      zh: '慢 (màn)',     ja: '遅い (おそい)' },
  { id: 65, category: 'adjectives', en: 'hot',      vi: 'nóng',      zh: '热 (rè)',      ja: '熱い (あつい)' },
  { id: 66, category: 'adjectives', en: 'cold',     vi: 'lạnh',      zh: '冷 (lěng)',    ja: '寒い (さむい)' },
  { id: 67, category: 'adjectives', en: 'happy',    vi: 'vui',       zh: '快乐 (kuàilè)',ja: '嬉しい (うれしい)' },
  { id: 68, category: 'adjectives', en: 'sad',      vi: 'buồn',      zh: '悲伤 (bēishāng)',ja: '悲しい (かなしい)' },
  { id: 69, category: 'adjectives', en: 'new',      vi: 'mới',       zh: '新 (xīn)',     ja: '新しい (あたらしい)' },
  { id: 70, category: 'adjectives', en: 'old',      vi: 'cũ',        zh: '旧 (jiù)',     ja: '古い (ふるい)' },
  { id: 71, category: 'adjectives', en: 'beautiful',vi: 'đẹp',       zh: '美丽 (měilì)', ja: '美しい (うつくしい)' },
  { id: 72, category: 'adjectives', en: 'strong',   vi: 'mạnh',      zh: '强壮 (qiángzhuàng)',ja: '強い (つよい)' },

  // Verbs (12)
  { id: 73, category: 'verbs', en: 'run',    vi: 'chạy',    zh: '跑 (pǎo)',    ja: '走る (はしる)' },
  { id: 74, category: 'verbs', en: 'walk',   vi: 'đi bộ',   zh: '走 (zǒu)',    ja: '歩く (あるく)' },
  { id: 75, category: 'verbs', en: 'eat',    vi: 'ăn',      zh: '吃 (chī)',    ja: '食べる (たべる)' },
  { id: 76, category: 'verbs', en: 'drink',  vi: 'uống',    zh: '喝 (hē)',     ja: '飲む (のむ)' },
  { id: 77, category: 'verbs', en: 'sleep',  vi: 'ngủ',     zh: '睡觉 (shuìjiào)',ja: '寝る (ねる)' },
  { id: 78, category: 'verbs', en: 'read',   vi: 'đọc',     zh: '读 (dú)',     ja: '読む (よむ)' },
  { id: 79, category: 'verbs', en: 'write',  vi: 'viết',    zh: '写 (xiě)',    ja: '書く (かく)' },
  { id: 80, category: 'verbs', en: 'learn',  vi: 'học',     zh: '学习 (xuéxí)',ja: '学ぶ (まなぶ)' },
  { id: 81, category: 'verbs', en: 'play',   vi: 'chơi',    zh: '玩 (wán)',    ja: '遊ぶ (あそぶ)' },
  { id: 82, category: 'verbs', en: 'work',   vi: 'làm việc',zh: '工作 (gōngzuò)',ja: '働く (はたらく)' },
  { id: 83, category: 'verbs', en: 'speak',  vi: 'nói',     zh: '说话 (shuōhuà)',ja: '話す (はなす)' },
  { id: 84, category: 'verbs', en: 'listen', vi: 'nghe',    zh: '听 (tīng)',   ja: '聞く (きく)' },

  // Transport (8)
  { id: 85, category: 'transport', en: 'car',   vi: 'xe hơi',  zh: '汽车 (qìchē)',  ja: '車 (くるま)' },
  { id: 86, category: 'transport', en: 'bus',   vi: 'xe buýt', zh: '公共汽车 (gōnggòng qìchē)',ja: 'バス' },
  { id: 87, category: 'transport', en: 'train', vi: 'tàu hỏa', zh: '火车 (huǒchē)', ja: '電車 (でんしゃ)' },
  { id: 88, category: 'transport', en: 'plane', vi: 'máy bay', zh: '飞机 (fēijī)',  ja: '飛行機 (ひこうき)' },
  { id: 89, category: 'transport', en: 'bike',  vi: 'xe đạp',  zh: '自行车 (zìxíngchē)',ja: '自転車 (じてんしゃ)' },
  { id: 90, category: 'transport', en: 'ship',  vi: 'tàu thủy',zh: '船 (chuán)',    ja: '船 (ふね)' },
  { id: 91, category: 'transport', en: 'taxi',  vi: 'taxi',    zh: '出租车 (chūzūchē)',ja: 'タクシー' },
  { id: 92, category: 'transport', en: 'boat',  vi: 'thuyền',  zh: '小船 (xiǎochuán)',ja: 'ボート' },

  // Clothes (8)
  { id: 93, category: 'clothes', en: 'shirt',   vi: 'áo sơ mi', zh: '衬衫 (chènshān)',  ja: 'シャツ' },
  { id: 94, category: 'clothes', en: 'pants',   vi: 'quần',     zh: '裤子 (kùzi)',      ja: 'ズボン' },
  { id: 95, category: 'clothes', en: 'shoes',   vi: 'giày',     zh: '鞋子 (xiézi)',     ja: '靴 (くつ)' },
  { id: 96, category: 'clothes', en: 'hat',     vi: 'mũ',       zh: '帽子 (màozi)',     ja: '帽子 (ぼうし)' },
  { id: 97, category: 'clothes', en: 'jacket',  vi: 'áo khoác', zh: '外套 (wàitào)',    ja: 'ジャケット' },
  { id: 98, category: 'clothes', en: 'dress',   vi: 'váy',      zh: '裙子 (qúnzi)',     ja: 'ドレス' },
  { id: 99, category: 'clothes', en: 'socks',   vi: 'tất',      zh: '袜子 (wàzi)',      ja: '靴下 (くつした)' },
  { id: 100, category: 'clothes', en: 'scarf',  vi: 'khăn quàng',zh: '围巾 (wéijīn)',  ja: 'スカーフ' },

  // Daily Objects (15)
  { id: 101, category: 'daily', en: 'house',    vi: 'nhà',       zh: '房子 (fángzi)',   ja: '家 (いえ)' },
  { id: 102, category: 'daily', en: 'school',   vi: 'trường học',zh: '学校 (xuéxiào)', ja: '学校 (がっこう)' },
  { id: 103, category: 'daily', en: 'book',     vi: 'sách',      zh: '书 (shū)',        ja: '本 (ほん)' },
  { id: 104, category: 'daily', en: 'phone',    vi: 'điện thoại',zh: '手机 (shǒujī)',  ja: 'スマホ' },
  { id: 105, category: 'daily', en: 'door',     vi: 'cửa',       zh: '门 (mén)',        ja: 'ドア' },
  { id: 106, category: 'daily', en: 'chair',    vi: 'ghế',       zh: '椅子 (yǐzi)',     ja: '椅子 (いす)' },
  { id: 107, category: 'daily', en: 'table',    vi: 'bàn',       zh: '桌子 (zhuōzi)',   ja: 'テーブル' },
  { id: 108, category: 'daily', en: 'computer', vi: 'máy tính',  zh: '电脑 (diànnǎo)', ja: 'コンピュータ' },
  { id: 109, category: 'daily', en: 'window',   vi: 'cửa sổ',    zh: '窗户 (chuānghù)',ja: '窓 (まど)' },
  { id: 110, category: 'daily', en: 'bed',      vi: 'giường',    zh: '床 (chuáng)',     ja: 'ベッド' },
  { id: 111, category: 'daily', en: 'clock',    vi: 'đồng hồ',   zh: '时钟 (shízhōng)',ja: '時計 (とけい)' },
  { id: 112, category: 'daily', en: 'key',      vi: 'chìa khóa', zh: '钥匙 (yàoshi)',   ja: '鍵 (かぎ)' },
  { id: 113, category: 'daily', en: 'money',    vi: 'tiền',      zh: '钱 (qián)',       ja: 'お金 (おかね)' },
  { id: 114, category: 'daily', en: 'bag',      vi: 'túi',       zh: '包 (bāo)',        ja: 'バッグ' },
  { id: 115, category: 'daily', en: 'mirror',   vi: 'gương',     zh: '镜子 (jìngzi)',   ja: '鏡 (かがみ)' },
]

export function getWordInLang(word: VocabWord, lang: string): string {
  return (word as Record<string, string>)[lang] ?? word.en
}
