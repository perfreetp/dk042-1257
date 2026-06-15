import type { Order } from '@/types';
import { mockBooks, getBookById } from './books';
import { mockCurrentUser } from './users';

const createOrderFromBook = (bookId: string, status: Order['status'], extra: Partial<Order> = {}): Order => {
  const book = getBookById(bookId)!;
  const timeline: Order['timeline'] = [
    { status: 'reserved', label: '发起预约', time: '2026-06-01 10:00', desc: `买家发起预订，价格¥${book.price}` }
  ];
  if (extra.appointmentTime) {
    timeline.push({
      status: 'reserved',
      label: '预约时间地点',
      time: '2026-06-01 10:05',
      desc: `${extra.appointmentTime} · ${extra.pickupLocation || '待定'}`
    });
  }
  if (status === 'approved' || status === 'pending' || status === 'completed' || status === 'reviewed') {
    timeline.push({ status: 'approved', label: '卖家同意', time: '2026-06-01 14:00', desc: '卖家同意预约' });
  }
  if (status === 'pending' || status === 'completed' || status === 'reviewed') {
    timeline.push({ status: 'pending', label: '约好取书', time: '2026-06-02 09:00', desc: '买卖双方确认时间地点，等待线下取书' });
  }
  if (status === 'completed' || status === 'reviewed') {
    timeline.push({ status: 'completed', label: '确认取书', time: '2026-06-03 15:00', desc: '买家已线下取书，交易完成' });
  }
  if (status === 'reviewed') {
    timeline.push({ status: 'reviewed', label: '评价完成', time: '2026-06-05 20:00', desc: '买家已评价，订单流程结束' });
  }
  return {
    id: `o${bookId}${status}`,
    bookId: book.id,
    bookTitle: book.title,
    bookCover: book.cover,
    bookPrice: book.price,
    condition: book.condition,
    seller: book.seller,
    buyer: mockCurrentUser,
    status,
    timeline,
    ...extra,
    createTime: '2026-06-01 10:00',
    updateTime: '2026-06-14 12:00'
  };
};

export const mockOrders: Order[] = [
  createOrderFromBook('b005', 'reserved', {
    appointmentTime: '2026-06-18 14:00',
    pickupLocation: '西校区二食堂门口',
    memo: '请带上复习笔记，谢谢~',
    createTime: '2026-06-13 09:20',
    updateTime: '2026-06-13 10:00'
  }),
  createOrderFromBook('b006', 'approved', {
    appointmentTime: '2026-06-17 18:30',
    pickupLocation: '东校区图书馆',
    bargainPrice: 13,
    createTime: '2026-06-14 11:30',
    updateTime: '2026-06-14 12:00'
  }),
  createOrderFromBook('b001', 'pending', {
    appointmentTime: '2026-06-16 15:00',
    pickupLocation: '南门快递点',
    memo: '我会带学生证',
    createTime: '2026-06-10 15:00',
    updateTime: '2026-06-15 09:00'
  }),
  createOrderFromBook('b012', 'completed', {
    createTime: '2026-05-28 10:00',
    updateTime: '2026-06-02 16:00'
  }),
  createOrderFromBook('b008', 'reviewed', {
    createTime: '2026-05-15 14:00',
    updateTime: '2026-05-22 20:00'
  }),
  createOrderFromBook('b011', 'completed', {
    createTime: '2026-05-10 11:00',
    updateTime: '2026-05-18 17:00'
  })
];

export const getOrdersByStatus = (status?: Order['status']): Order[] => {
  if (!status) return mockOrders;
  return mockOrders.filter(o => o.status === status);
};
