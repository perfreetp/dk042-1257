import type { UserInfo } from '@/types';

export const mockSellers: UserInfo[] = [
  {
    id: 'u001',
    name: '张同学',
    avatar: 'https://picsum.photos/id/64/200/200',
    college: '计算机学院',
    creditScore: 98,
    tradeCount: 42,
    noShowCount: 0
  },
  {
    id: 'u002',
    name: '李学姐',
    avatar: 'https://picsum.photos/id/91/200/200',
    college: '经济管理学院',
    creditScore: 95,
    tradeCount: 28,
    noShowCount: 1
  },
  {
    id: 'u003',
    name: '王学长',
    avatar: 'https://picsum.photos/id/177/200/200',
    college: '机械工程学院',
    creditScore: 92,
    tradeCount: 35,
    noShowCount: 2
  },
  {
    id: 'u004',
    name: '赵同学',
    avatar: 'https://picsum.photos/id/338/200/200',
    college: '外国语学院',
    creditScore: 99,
    tradeCount: 18,
    noShowCount: 0
  },
  {
    id: 'u005',
    name: '刘学长',
    avatar: 'https://picsum.photos/id/1027/200/200',
    college: '数学学院',
    creditScore: 90,
    tradeCount: 22,
    noShowCount: 1
  }
];

export const mockCurrentUser: UserInfo = {
  id: 'u000',
  name: '我',
  avatar: 'https://picsum.photos/id/1012/200/200',
  college: '计算机学院',
  creditScore: 96,
  tradeCount: 12,
  noShowCount: 0
};
