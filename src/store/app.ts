import { create } from 'zustand';
import type { Order, Book, PricePoint } from '@/types';
import { mockOrders } from '@/data/orders';
import { mockBooks, getBookById, mockPriceHistory } from '@/data/books';
import { mockCurrentUser } from '@/data/users';

export interface BargainRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCover: string;
  originalPrice: number;
  bargainPrice: number;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  sellerName: string;
  createTime: string;
}

interface AppState {
  orders: Order[];
  bargainRecords: BargainRecord[];
  favoriteBookIds: string[];
  searchKeyword: string;
  searchType: 'all' | 'title' | 'isbn' | 'course' | 'college';

  setSearchKeyword: (kw: string) => void;
  setSearchType: (type: 'all' | 'title' | 'isbn' | 'course' | 'college') => void;

  createOrder: (bookId: string, options?: Partial<Order>) => Order;
  cancelOrder: (orderId: string) => void;
  markPending: (orderId: string) => void;
  confirmPickup: (orderId: string) => void;
  reviewOrder: (orderId: string) => void;
  updateOrderMemo: (orderId: string, memo: string) => void;

  addBargain: (bookId: string, price: number, message: string) => BargainRecord;

  toggleFavorite: (bookId: string) => boolean;
  isFavorite: (bookId: string) => boolean;

  getPriceHistory: (bookId?: string) => PricePoint[];
}

let orderSeq = 100;
let bargainSeq = 100;

const genOrderId = () => {
  orderSeq += 1;
  return `o${Date.now().toString().slice(-6)}${orderSeq}`;
};

const genBargainId = () => {
  bargainSeq += 1;
  return `bg${Date.now().toString().slice(-6)}${bargainSeq}`;
};

const nowStr = () => {
  const d = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export const useAppStore = create<AppState>((set, get) => ({
  orders: [...mockOrders],
  bargainRecords: [],
  favoriteBookIds: ['b001', 'b005', 'b008'],
  searchKeyword: '',
  searchType: 'all',

  setSearchKeyword: (kw) => set({ searchKeyword: kw }),
  setSearchType: (type) => set({ searchType: type }),

  createOrder: (bookId, options = {}) => {
    const book = getBookById(bookId);
    if (!book) throw new Error('Book not found');
    const newOrder: Order = {
      id: genOrderId(),
      bookId: book.id,
      bookTitle: book.title,
      bookCover: book.cover,
      bookPrice: book.price,
      condition: book.condition,
      seller: book.seller,
      buyer: mockCurrentUser,
      status: 'reserved',
      createTime: nowStr(),
      updateTime: nowStr(),
      ...options
    };
    set((state) => ({ orders: [newOrder, ...state.orders] }));
    return newOrder;
  },

  cancelOrder: (orderId) => {
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== orderId)
    }));
  },

  markPending: (orderId) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status: 'pending', updateTime: nowStr() } : o
      )
    }));
  },

  confirmPickup: (orderId) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status: 'completed', updateTime: nowStr() } : o
      )
    }));
  },

  reviewOrder: (orderId) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, status: 'reviewed', updateTime: nowStr() } : o
      )
    }));
  },

  updateOrderMemo: (orderId, memo) => {
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === orderId ? { ...o, memo, updateTime: nowStr() } : o
      )
    }));
  },

  addBargain: (bookId, price, message) => {
    const book = getBookById(bookId);
    if (!book) throw new Error('Book not found');
    const record: BargainRecord = {
      id: genBargainId(),
      bookId: book.id,
      bookTitle: book.title,
      bookCover: book.cover,
      originalPrice: book.price,
      bargainPrice: price,
      message,
      status: 'pending',
      sellerName: book.seller.name,
      createTime: nowStr()
    };
    set((state) => ({ bargainRecords: [record, ...state.bargainRecords] }));
    return record;
  },

  toggleFavorite: (bookId) => {
    const { favoriteBookIds } = get();
    const has = favoriteBookIds.includes(bookId);
    if (has) {
      set({ favoriteBookIds: favoriteBookIds.filter((id) => id !== bookId) });
      return false;
    } else {
      set({ favoriteBookIds: [...favoriteBookIds, bookId] });
      return true;
    }
  },

  isFavorite: (bookId) => {
    return get().favoriteBookIds.includes(bookId);
  },

  getPriceHistory: (bookId) => {
    if (!bookId) return mockPriceHistory;
    const book = getBookById(bookId);
    if (!book) return [];
    const basePrice = book.price;
    return mockPriceHistory.map((p, i) => ({
      date: p.date,
      avgPrice: Math.round(basePrice * (0.85 + i * 0.03)),
      minPrice: Math.round(basePrice * (0.65 + i * 0.03)),
      maxPrice: Math.round(basePrice * (1.05 + i * 0.03)),
      count: p.count
    }));
  }
}));
