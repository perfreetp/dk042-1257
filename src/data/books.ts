import type { Book } from '@/types';
import { mockSellers } from './users';
import { mockColleges } from './colleges';

const bookImageMap: Record<string, number[]> = {
  tech: [1, 2, 3, 6, 8, 9, 119, 160, 201],
  general: [225, 230, 250, 292, 431, 570, 582, 598, 625]
};

const getBookCover = (idx: number) => {
  const ids = bookImageMap.tech;
  return `https://picsum.photos/id/${ids[idx % ids.length]}/300/400`;
};

const getBookImages = (baseId: number) => {
  const ids = [baseId, baseId + 1, baseId + 2, baseId + 3].map(i => {
    const pool = bookImageMap.general;
    return pool[i % pool.length];
  });
  return [
    { url: `https://picsum.photos/id/${ids[0]}/750/500`, desc: '封面实拍' },
    { url: `https://picsum.photos/id/${ids[1]}/750/500`, desc: '内页详情' },
    { url: `https://picsum.photos/id/${ids[2]}/750/500`, desc: '笔记展示' },
    { url: `https://picsum.photos/id/${ids[3]}/750/500`, desc: '书脊/封底' }
  ];
};

export const mockBooks: Book[] = [
  {
    id: 'b001',
    title: '数据结构（C语言版）',
    isbn: '9787302147510',
    author: '严蔚敏、吴伟民',
    publisher: '清华大学出版社',
    edition: '第5版',
    cover: getBookCover(0),
    images: getBookImages(0),
    condition: '九成新',
    hasNotes: true,
    notesDesc: '重点章节有荧光笔划线，少量手写笔记，字迹工整清晰',
    originalPrice: 45,
    price: 18,
    priceMin: 15,
    priceMax: 25,
    college: '计算机学院',
    course: '数据结构',
    courseCode: 'CS101',
    pickupLocations: ['东校区图书馆', '南门快递点', '计算机学院楼A座'],
    seller: mockSellers[0],
    versionMatch: true,
    recommendedList: ['b002', 'b003', 'b010'],
    publishTime: '2026-06-10 14:30',
    viewCount: 256,
    favoriteCount: 42,
    description: '自用教材，一学期课结束后闲置。书皮有轻微使用痕迹，内页干净，无缺页。附有课堂整理的复习重点，适合期末复习使用。可小刀~',
    canBargain: true
  },
  {
    id: 'b002',
    title: '计算机网络：自顶向下方法',
    isbn: '9787111453796',
    author: 'James F. Kurose',
    publisher: '机械工业出版社',
    edition: '第7版',
    cover: getBookCover(1),
    images: getBookImages(4),
    condition: '八成新',
    hasNotes: false,
    notesDesc: '无笔记无划线，仅书角有轻微折痕',
    originalPrice: 79,
    price: 32,
    priceMin: 28,
    priceMax: 45,
    college: '计算机学院',
    course: '计算机网络',
    courseCode: 'CS102',
    pickupLocations: ['东校区一食堂门口', '北门咖啡厅'],
    seller: mockSellers[1],
    versionMatch: true,
    recommendedList: ['b001', 'b003', 'b005'],
    publishTime: '2026-06-12 09:15',
    viewCount: 189,
    favoriteCount: 31,
    description: '经典计算机网络教材，翻译版。全书基本无笔记，适合对网络协议有学习需求的同学。',
    canBargain: true
  },
  {
    id: 'b003',
    title: '操作系统概念',
    isbn: '9787040283419',
    author: 'Abraham Silberschatz',
    publisher: '高等教育出版社',
    edition: '第9版',
    cover: getBookCover(2),
    images: getBookImages(1),
    condition: '九成新',
    hasNotes: true,
    notesDesc: '前6章有少量笔记，全部用铅笔书写，可擦除',
    originalPrice: 69,
    price: 28,
    priceMin: 25,
    priceMax: 40,
    college: '计算机学院',
    course: '操作系统',
    courseCode: 'CS103',
    pickupLocations: ['西校区图书馆', '南门地铁站C口'],
    seller: mockSellers[2],
    versionMatch: true,
    recommendedList: ['b001', 'b002', 'b004'],
    publishTime: '2026-06-08 16:45',
    viewCount: 312,
    favoriteCount: 55,
    description: '国外经典操作系统教材，内容全面。铅笔笔记已全部擦除，几乎像新书。',
    canBargain: false
  },
  {
    id: 'b004',
    title: '数据库系统概论',
    isbn: '9787040195835',
    author: '王珊、萨师煊',
    publisher: '高等教育出版社',
    edition: '第5版',
    cover: getBookCover(3),
    images: getBookImages(2),
    condition: '八成新',
    hasNotes: true,
    notesDesc: '关键概念有下划线标注，部分页面贴有便利贴',
    originalPrice: 55,
    price: 20,
    priceMin: 18,
    priceMax: 30,
    college: '计算机学院',
    course: '数据库原理',
    courseCode: 'CS104',
    pickupLocations: ['东校区图书馆', '计算机学院楼B座', '南门商业街'],
    seller: mockSellers[0],
    versionMatch: true,
    recommendedList: ['b003', 'b005', 'b010'],
    publishTime: '2026-06-05 11:20',
    viewCount: 143,
    favoriteCount: 19,
    description: '数据库经典教材，笔记都是期末复习时标注的重点，方便考试前快速过一遍。',
    canBargain: true
  },
  {
    id: 'b005',
    title: '高等数学（上册）',
    isbn: '9787040396638',
    author: '同济大学数学系',
    publisher: '高等教育出版社',
    edition: '第7版',
    cover: getBookCover(4),
    images: getBookImages(3),
    condition: '七成新',
    hasNotes: true,
    notesDesc: '例题旁边有解题思路，部分习题有草稿',
    originalPrice: 45,
    price: 12,
    priceMin: 10,
    priceMax: 18,
    college: '数学学院',
    course: '高等数学',
    courseCode: 'MATH101',
    pickupLocations: ['西校区二食堂门口', '北门'],
    seller: mockSellers[4],
    versionMatch: true,
    recommendedList: ['b006', 'b007', 'b011'],
    publishTime: '2026-06-11 20:05',
    viewCount: 428,
    favoriteCount: 86,
    description: '高数课本，有大量手写笔记和解题思路，非常适合自学和复习。',
    canBargain: true
  },
  {
    id: 'b006',
    title: '线性代数',
    isbn: '9787040212181',
    author: '同济大学数学系',
    publisher: '高等教育出版社',
    edition: '第6版',
    cover: getBookCover(5),
    images: getBookImages(5),
    condition: '九成新',
    hasNotes: false,
    notesDesc: '基本全新，仅封面有名字签名',
    originalPrice: 29,
    price: 15,
    priceMin: 12,
    priceMax: 20,
    college: '数学学院',
    course: '线性代数',
    courseCode: 'MATH102',
    pickupLocations: ['东校区图书馆', '南门'],
    seller: mockSellers[3],
    versionMatch: true,
    recommendedList: ['b005', 'b007', 'b008'],
    publishTime: '2026-06-09 13:30',
    viewCount: 265,
    favoriteCount: 44,
    description: '线性代数教材，几乎全新。考试90分学长的书，买就送复习资料电子版~',
    canBargain: true
  },
  {
    id: 'b007',
    title: '概率论与数理统计',
    isbn: '9787040101669',
    author: '盛骤、谢式千、潘承毅',
    publisher: '高等教育出版社',
    edition: '第4版',
    cover: getBookCover(6),
    images: getBookImages(6),
    condition: '八成新',
    hasNotes: true,
    notesDesc: '公式推导有手写注释，典型例题有解题过程',
    originalPrice: 38,
    price: 15,
    priceMin: 13,
    priceMax: 22,
    college: '数学学院',
    course: '概率论与数理统计',
    courseCode: 'MATH103',
    pickupLocations: ['西校区图书馆', '数学学院楼'],
    seller: mockSellers[4],
    versionMatch: true,
    recommendedList: ['b005', 'b006', 'b012'],
    publishTime: '2026-06-13 08:50',
    viewCount: 198,
    favoriteCount: 37,
    description: '浙大版概率论，公式旁边有详细推导笔记，便于理解。',
    canBargain: true
  },
  {
    id: 'b008',
    title: '微观经济学',
    isbn: '9787300171333',
    author: '高鸿业',
    publisher: '中国人民大学出版社',
    edition: '第7版',
    cover: getBookCover(7),
    images: getBookImages(7),
    condition: '九成新',
    hasNotes: true,
    notesDesc: '重点章节贴有彩色便利贴，笔记写在便利贴上',
    originalPrice: 42,
    price: 18,
    priceMin: 15,
    priceMax: 26,
    college: '经济管理学院',
    course: '微观经济学',
    courseCode: 'ECO101',
    pickupLocations: ['东校区三食堂门口', '经济管理学院楼'],
    seller: mockSellers[1],
    versionMatch: true,
    recommendedList: ['b009', 'b010', 'b013'],
    publishTime: '2026-06-07 15:20',
    viewCount: 221,
    favoriteCount: 28,
    description: '考研专业课用过的教材，笔记都是上课重点整理，非常齐全。',
    canBargain: true
  },
  {
    id: 'b009',
    title: '宏观经济学',
    isbn: '9787300252599',
    author: '高鸿业',
    publisher: '中国人民大学出版社',
    edition: '第7版',
    cover: getBookCover(8),
    images: getBookImages(2),
    condition: '八成新',
    hasNotes: false,
    notesDesc: '少量下划线，无手写笔记',
    originalPrice: 45,
    price: 20,
    priceMin: 18,
    priceMax: 28,
    college: '经济管理学院',
    course: '宏观经济学',
    courseCode: 'ECO102',
    pickupLocations: ['东门公交站旁', '经济管理学院楼C座'],
    seller: mockSellers[1],
    versionMatch: true,
    recommendedList: ['b008', 'b010', 'b011'],
    publishTime: '2026-06-14 10:10',
    viewCount: 156,
    favoriteCount: 22,
    description: '宏观经济学教材，品相不错，适合考研或者课程学习。',
    canBargain: false
  },
  {
    id: 'b010',
    title: '管理学原理与方法',
    isbn: '9787309060997',
    author: '周三多',
    publisher: '复旦大学出版社',
    edition: '第7版',
    cover: getBookCover(0),
    images: getBookImages(1),
    condition: '六成新及以下',
    hasNotes: true,
    notesDesc: '大量笔记、划线，有折叠痕迹，部分页面有咖啡渍但不影响阅读',
    originalPrice: 42,
    price: 8,
    priceMin: 6,
    priceMax: 15,
    college: '经济管理学院',
    course: '管理学原理',
    courseCode: 'MGT101',
    pickupLocations: ['南门菜鸟驿站旁边'],
    seller: mockSellers[2],
    versionMatch: true,
    recommendedList: ['b008', 'b009', 'b013'],
    publishTime: '2026-06-06 19:00',
    viewCount: 98,
    favoriteCount: 11,
    description: '书有点旧，但笔记非常详细，重点全部标注了，适合只需要内容不看重品相的同学。',
    canBargain: true
  },
  {
    id: 'b011',
    title: '大学物理（上册）',
    isbn: '9787040155730',
    author: '马文蔚',
    publisher: '高等教育出版社',
    edition: '第6版',
    cover: getBookCover(3),
    images: getBookImages(4),
    condition: '九成新',
    hasNotes: true,
    notesDesc: '公式推导处有补充说明，课后习题部分有解答',
    originalPrice: 40,
    price: 16,
    priceMin: 14,
    priceMax: 22,
    college: '物理学院',
    course: '大学物理',
    courseCode: 'PHY101',
    pickupLocations: ['东校区图书馆', '物理实验楼'],
    seller: mockSellers[0],
    versionMatch: true,
    recommendedList: ['b012', 'b005', 'b006'],
    publishTime: '2026-06-12 17:30',
    viewCount: 178,
    favoriteCount: 29,
    description: '物理教材，笔记很详细，买了送往年期末试卷~',
    canBargain: true
  },
  {
    id: 'b012',
    title: '新视野大学英语（第三版）读写教程1',
    isbn: '9787513556811',
    author: '郑树棠',
    publisher: '外语教学与研究出版社',
    edition: '第3版',
    cover: getBookCover(5),
    images: getBookImages(6),
    condition: '八成新',
    hasNotes: true,
    notesDesc: '课文有生词标注，翻译练习有答案手写',
    originalPrice: 49,
    price: 18,
    priceMin: 15,
    priceMax: 25,
    college: '外国语学院',
    course: '大学英语',
    courseCode: 'ENG101',
    pickupLocations: ['西门外语学院楼', '东校区图书馆'],
    seller: mockSellers[3],
    versionMatch: true,
    recommendedList: ['b008', 'b011', 'b013'],
    publishTime: '2026-06-09 21:15',
    viewCount: 342,
    favoriteCount: 61,
    description: '大学英语教材，含光盘，词汇部分有详细注释整理。',
    canBargain: true
  },
  {
    id: 'b013',
    title: '工程力学',
    isbn: '9787040072655',
    author: '范钦珊',
    publisher: '高等教育出版社',
    edition: '第4版',
    cover: getBookCover(1),
    images: getBookImages(7),
    condition: '八成新',
    hasNotes: false,
    notesDesc: '无笔记，例题旁有少量铅笔打勾',
    originalPrice: 52,
    price: 22,
    priceMin: 18,
    priceMax: 30,
    college: '机械工程学院',
    course: '工程力学',
    courseCode: 'ME101',
    pickupLocations: ['南门地铁站', '机械学院楼大厅'],
    seller: mockSellers[2],
    versionMatch: true,
    recommendedList: ['b014', 'b005', 'b011'],
    publishTime: '2026-06-13 14:00',
    viewCount: 89,
    favoriteCount: 15,
    description: '工程力学教材，保存不错，适合机械专业同学。',
    canBargain: true
  },
  {
    id: 'b014',
    title: '机械设计基础',
    isbn: '9787040192094',
    author: '杨可桢、程光蕴',
    publisher: '高等教育出版社',
    edition: '第5版',
    cover: getBookCover(2),
    images: getBookImages(3),
    condition: '九成新',
    hasNotes: true,
    notesDesc: '重点公式有标注，部分章节贴有书签',
    originalPrice: 46,
    price: 20,
    priceMin: 18,
    priceMax: 28,
    college: '机械工程学院',
    course: '机械设计基础',
    courseCode: 'ME102',
    pickupLocations: ['机械学院楼', '东校区一食堂'],
    seller: mockSellers[2],
    versionMatch: true,
    recommendedList: ['b013', 'b005', 'b011'],
    publishTime: '2026-06-08 10:45',
    viewCount: 76,
    favoriteCount: 13,
    description: '机械设计基础，附赠课程PPT课件电子版。',
    canBargain: true
  }
];

export const getBookById = (id: string): Book | undefined => {
  return mockBooks.find(book => book.id === id);
};

export const getBooksByCourse = (courseIdOrCode: string): Book[] => {
  const code = courseIdOrCode.toUpperCase();
  const byCode = mockBooks.filter(book => book.courseCode.toUpperCase() === code);
  if (byCode.length > 0) return byCode;
  const courseName = mockColleges
    .flatMap(c => c.courses)
    .find(c => c.id === courseIdOrCode || c.code.toUpperCase() === code);
  if (courseName) {
    return mockBooks.filter(book =>
      book.course === courseName.name || book.courseCode.toUpperCase() === courseName.code.toUpperCase()
    );
  }
  return mockBooks.filter(book =>
    book.courseCode.toUpperCase() === code || book.course === courseIdOrCode
  );
};

export const getBooksByCollege = (college: string): Book[] => {
  return mockBooks.filter(book => book.college === college);
};

export const searchBooks = (keyword: string, type: string = 'all'): Book[] => {
  const kw = keyword.toLowerCase().trim();
  if (!kw) return mockBooks;
  return mockBooks.filter(book => {
    if (type === 'title') return book.title.toLowerCase().includes(kw);
    if (type === 'isbn') return book.isbn.includes(kw);
    if (type === 'course') return book.course.toLowerCase().includes(kw) || book.courseCode.toLowerCase().includes(kw);
    if (type === 'college') return book.college.includes(kw);
    return book.title.toLowerCase().includes(kw)
      || book.isbn.includes(kw)
      || book.course.toLowerCase().includes(kw)
      || book.college.includes(kw)
      || book.author.includes(kw);
  });
};

export const mockPriceHistory = [
  { date: '3月', avgPrice: 25, minPrice: 15, maxPrice: 38, count: 12 },
  { date: '4月', avgPrice: 23, minPrice: 12, maxPrice: 35, count: 28 },
  { date: '5月', avgPrice: 20, minPrice: 10, maxPrice: 32, count: 45 },
  { date: '6月', avgPrice: 18, minPrice: 8, maxPrice: 28, count: 86 },
  { date: '7月', avgPrice: 22, minPrice: 14, maxPrice: 36, count: 34 },
  { date: '8月', avgPrice: 28, minPrice: 18, maxPrice: 42, count: 92 }
];
