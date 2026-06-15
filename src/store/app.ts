import { create } from 'zustand';
import type { Order, Book, PricePoint, TimelineNode, OrderStatus } from '@/types';
import { mockOrders } from '@/data/orders';
import { mockBooks, getBookById, mockPriceHistory } from '@/data/books';
import { mockCurrentUser } from '@/data/users';

export type Role = 'buyer' | 'seller';

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
  currentUser: typeof mockCurrentUser;
  orders: Order[];
  bargainRecords: BargainRecord[];
  favoriteBookIds: string[];
  publishedBookIds: string[];
  searchKeyword: string;
  searchType: 'all' | 'title' | 'isbn' | 'course' | 'college';

  setSearchKeyword: (kw: string) => void;
  setSearchType: (type: 'all' | 'title' | 'isbn' | 'course' | 'college') => void;

  isBuyer: (order: Order) => boolean;
  isSeller: (order: Order) => boolean;
  getOrderRole: (order: Order) => Role;

  getBuyerOrders: () => Order[];
  getSellerOrders: () => Order[];

  createOrder: (bookId: string, options?: Partial<Order>) => Order;
  cancelOrder: (orderId: string) => void;
  approveOrder: (orderId: string, newTime?: string, newLocation?: string) => void;
  rejectOrder: (orderId: string, reason?: string) => void;
  rescheduleOrder: (orderId: string, newTime: string, newLocation: string) => void;
  markPending: (orderId: string) => void;
  confirmPickup: (orderId: string) => void;
  reviewOrder: (orderId: string) => void;
  updateOrderMemo: (orderId: string, memo: string) => void;

  addBargain: (bookId: string, price: number, message: string) => BargainRecord;

  toggleFavorite: (bookId: string) => boolean;
  isFavorite: (bookId: string) => boolean;
  getBookAvailability: (bookId: string) => 'available' | 'reserved' | 'sold';

  getMyPublishedBooks: () => Book[];
  getBookOrders: (bookId: string) => Order[];

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

const appendTimeline = (order: Order, node: TimelineNode): Order => {
  return { ...order, timeline: [...order.timeline, node], updateTime: nowStr() };
};

const initialPublishedIds = mockBooks
  .filter(b => b.seller.id === mockCurrentUser.id)
  .map(b => b.id);

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: mockCurrentUser,
  orders: [...mockOrders],
  bargainRecords: [],
  favoriteBookIds: ['b001', 'b005', 'b008'],
  publishedBookIds: initialPublishedIds,
  searchKeyword: '',
  searchType: 'all',

  setSearchKeyword: (kw) => set({ searchKeyword: kw }),
  setSearchType: (type) => set({ searchType: type }),

  isBuyer: (order) => order.buyer.id === get().currentUser.id,
  isSeller: (order) => order.seller.id === get().currentUser.id,
  getOrderRole: (order) => {
    const user = get().currentUser;
    if (order.seller.id === user.id) return 'seller';
    return 'buyer';
  },

  getBuyerOrders: () => {
    const user = get().currentUser;
    return get().orders.filter(o => o.buyer.id === user.id);
  },

  getSellerOrders: () => {
    const user = get().currentUser;
    return get().orders.filter(o => o.seller.id === user.id);
  },

  createOrder: (bookId, options = {}) => {
    const book = getBookById(bookId);
    if (!book) throw new Error('Book not found');
    const now = nowStr();
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
      timeline: [
        { status: 'reserved', label: '发起预约', time: now, desc: `买家发起预订，价格¥${book.price}` }
      ],
      createTime: now,
      updateTime: now,
      ...options
    };
    if (newOrder.appointmentTime) {
      newOrder.timeline.push({
        status: 'reserved',
        label: '预约时间地点',
        time: now,
        desc: `${newOrder.appointmentTime} · ${newOrder.pickupLocation || '待定'}`
      });
    }
    set((state) => ({ orders: [newOrder, ...state.orders] }));
    return newOrder;
  },

  cancelOrder: (orderId) => {
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== orderId)
    }));
  },

  approveOrder: (orderId, newTime, newLocation) => {
    set((state) => ({
      orders: state.orders.map((o) => {
        if (o.id !== orderId) return o;
        const desc = newTime
          ? `卖家同意预约，时间调整为 ${newTime}${newLocation ? ' · ' + newLocation : ''}`
          : '卖家同意预约';
        const updated = appendTimeline(o, { status: 'approved', label: '卖家同意', time: nowStr(), desc });
        return {
          ...updated,
          status: 'approved' as OrderStatus,
          appointmentTime: newTime || o.appointmentTime,
          pickupLocation: newLocation || o.pickupLocation
        };
      })
    }));
  },

  rejectOrder: (orderId, reason) => {
    set((state) => ({
      orders: state.orders.map((o) => {
        if (o.id !== orderId) return o;
        return appendTimeline(o, {
          status: 'rejected',
          label: '卖家拒绝',
          time: nowStr(),
          desc: reason || '卖家拒绝了本次预约'
        });
      }).map((o) =>
        o.id === orderId ? { ...o, status: 'rejected' as OrderStatus } : o
      )
    }));
  },

  rescheduleOrder: (orderId, newTime, newLocation) => {
    set((state) => ({
      orders: state.orders.map((o) => {
        if (o.id !== orderId) return o;
        const updated = appendTimeline(o, {
          status: o.status,
          label: '改约',
          time: nowStr(),
          desc: `时间改为 ${newTime}，地点改为 ${newLocation}`
        });
        return {
          ...updated,
          appointmentTime: newTime,
          pickupLocation: newLocation
        };
      })
    }));
  },

  markPending: (orderId) => {
    set((state) => ({
      orders: state.orders.map((o) => {
        if (o.id !== orderId) return o;
        const updated = appendTimeline(o, {
          status: 'pending',
          label: '约好取书',
          time: nowStr(),
          desc: '买卖双方确认时间地点，等待线下取书'
        });
        return { ...updated, status: 'pending' as OrderStatus };
      })
    }));
  },

  confirmPickup: (orderId) => {
    set((state) => ({
      orders: state.orders.map((o) => {
        if (o.id !== orderId) return o;
        const updated = appendTimeline(o, {
          status: 'completed',
          label: '确认取书',
          time: nowStr(),
          desc: '买家已线下取书，交易完成'
        });
        return { ...updated, status: 'completed' as OrderStatus };
      })
    }));
  },

  reviewOrder: (orderId) => {
    set((state) => ({
      orders: state.orders.map((o) => {
        if (o.id !== orderId) return o;
        const updated = appendTimeline(o, {
          status: 'reviewed',
          label: '评价完成',
          time: nowStr(),
          desc: '买家已评价，订单流程结束'
        });
        return { ...updated, status: 'reviewed' as OrderStatus };
      })
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

  getBookAvailability: (bookId) => {
    const { orders } = get();
    const hasCompleted = orders.some(o => o.bookId === bookId && (o.status === 'completed' || o.status === 'reviewed'));
    if (hasCompleted) return 'sold';
    const hasActive = orders.some(o => o.bookId === bookId && ['reserved', 'approved', 'pending'].includes(o.status));
    if (hasActive) return 'reserved';
    return 'available';
  },

  getMyPublishedBooks: () => {
    const { publishedBookIds } = get();
    return publishedBookIds
      .map(id => getBookById(id))
      .filter(Boolean) as Book[];
  },

  getBookOrders: (bookId) => {
    return get().orders.filter(o => o.bookId === bookId);
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
