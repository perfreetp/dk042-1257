export type BookCondition = '九成新' | '八成新' | '七成新' | '六成新及以下';

export type OrderStatus = 'reserved' | 'approved' | 'pending' | 'completed' | 'reviewed' | 'rejected';

export interface TimelineNode {
  status: string;
  label: string;
  time: string;
  desc?: string;
}

export interface UserInfo {
  id: string;
  name: string;
  avatar: string;
  college: string;
  creditScore: number;
  tradeCount: number;
  noShowCount: number;
}

export interface BookImage {
  url: string;
  desc?: string;
}

export interface Book {
  id: string;
  title: string;
  isbn: string;
  author: string;
  publisher: string;
  edition: string;
  cover: string;
  images: BookImage[];
  condition: BookCondition;
  hasNotes: boolean;
  notesDesc: string;
  originalPrice: number;
  price: number;
  priceMin?: number;
  priceMax?: number;
  college: string;
  course: string;
  courseCode: string;
  pickupLocations: string[];
  seller: UserInfo;
  versionMatch: boolean;
  recommendedList?: string[];
  publishTime: string;
  viewCount: number;
  favoriteCount: number;
  description: string;
  canBargain: boolean;
}

export interface College {
  id: string;
  name: string;
  icon: string;
  courses: Course[];
}

export interface Course {
  id: string;
  name: string;
  code: string;
  bookCount: number;
}

export interface Order {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCover: string;
  bookPrice: number;
  condition: BookCondition;
  seller: UserInfo;
  buyer: UserInfo;
  status: OrderStatus;
  appointmentTime?: string;
  pickupLocation?: string;
  bargainPrice?: number;
  memo?: string;
  timeline: TimelineNode[];
  createTime: string;
  updateTime: string;
}

export interface PricePoint {
  date: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  count: number;
}

export interface SearchFilter {
  keyword: string;
  type: 'all' | 'title' | 'isbn' | 'course' | 'college';
  condition?: BookCondition[];
  hasNotes?: boolean;
  priceRange?: [number, number];
  college?: string;
  course?: string;
  sortBy?: 'price' | 'time' | 'credit';
}
