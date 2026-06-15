import React, { useMemo } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { mockCurrentUser } from '@/data/users';
import { getBookById, mockPriceHistory } from '@/data/books';
import BookCard from '@/components/BookCard';
import PriceTrendChart from '@/components/PriceTrendChart';
import EmptyState from '@/components/EmptyState';
import { useAppStore } from '@/store/app';
import type { Book } from '@/types';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const user = mockCurrentUser;
  const { favoriteBookIds, toggleFavorite, orders, getBookAvailability } = useAppStore();

  const favBooks = useMemo(() => {
    return favoriteBookIds
      .map(id => {
        const book = getBookById(id);
        if (!book) return null;
        return { ...book, availability: getBookAvailability(id) };
      })
      .filter(Boolean) as (Book & { availability: 'available' | 'reserved' | 'sold' })[];
  }, [favoriteBookIds, orders]);

  const stats = [
    { num: orders.length, label: '全部订单' },
    { num: user.tradeCount, label: '交易次数' },
    { num: favBooks.length, label: '我的收藏' },
    { num: 0, label: '发布中' }
  ];

  const handleMenuClick = (type: string) => {
    console.log('[Mine] menu click:', type);
    switch (type) {
      case 'favorites':
        Taro.showToast({ title: `收藏了${favBooks.length}本书`, icon: 'none' });
        break;
      case 'pricechart':
        Taro.navigateTo({ url: '/pages/pricechart/index' });
        break;
      case 'bookalert':
        Taro.navigateTo({ url: '/pages/bookalert/index' });
        break;
      case 'bargain':
        Taro.navigateTo({ url: '/pages/bargain/index' });
        break;
      case 'appointment':
        Taro.navigateTo({ url: '/pages/appointment/index' });
        break;
      case 'report':
        Taro.showActionSheet({
          itemList: ['举报盗版教材', '举报虚假信息', '举报不良行为'],
          success: (res) => {
            Taro.showToast({ title: '举报已提交，感谢反馈', icon: 'success' });
          }
        });
        break;
      case 'noshow':
        Taro.showModal({
          title: '标记爽约',
          content: '请输入要标记爽约的订单号或用户昵称，我们将进行核实处理。',
          placeholderText: '输入订单号/昵称',
          editable: true,
          success: (res) => {
            if (res.confirm && res.content) {
              Taro.showToast({ title: '已记录，将尽快核实', icon: 'success' });
            }
          }
        });
        break;
      case 'memo':
        Taro.showModal({
          title: '交易备忘',
          content: '你可以在这里记录重要交易信息、对方联系方式、约定内容等，备忘仅自己可见。',
          confirmText: '添加备忘',
          success: (res) => {
            if (res.confirm) {
              Taro.showToast({ title: '备忘功能开发中', icon: 'none' });
            }
          }
        });
        break;
      case 'publish':
        Taro.switchTab({ url: '/pages/publish/index' });
        break;
      case 'orders':
        Taro.switchTab({ url: '/pages/orders/index' });
        break;
      case 'help':
        Taro.showToast({ title: '客服接入中...', icon: 'none' });
        break;
    }
  };

  const menus = [
    [
      { icon: '⭐', cls: styles.iconGold, title: '我的收藏', desc: `${favBooks.length}本心仪教材`, type: 'favorites' },
      { icon: '📈', cls: styles.iconBlue, title: '价格走势', desc: '热门教材行情参考', type: 'pricechart' },
      { icon: '🔔', cls: styles.iconOrange, title: '缺书提醒', desc: '有货第一时间通知', type: 'bookalert' }
    ],
    [
      { icon: '💰', cls: styles.iconGold, title: '我的砍价', desc: '查看砍价记录进度', type: 'bargain' },
      { icon: '📅', cls: styles.iconTeal, title: '预约验书', desc: '预约记录管理', type: 'appointment' },
      { icon: '📤', cls: styles.iconBlue, title: '我要发布', desc: '闲置教材变现', type: 'publish' }
    ],
    [
      { icon: '🚨', cls: styles.iconRed, title: '举报盗版', desc: '维护正版，打击盗版', type: 'report' },
      { icon: '⚠️', cls: styles.iconOrange, title: '爽约标记', desc: '失信用户举报', type: 'noshow' },
      { icon: '📝', cls: styles.iconGreen, title: '交易备忘', desc: '重要信息本地记录', type: 'memo' },
      { icon: '💬', cls: styles.iconBlue, title: '帮助反馈', desc: '联系客服与建议', type: 'help' }
    ]
  ];

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.userHeader}>
        <View className={styles.userRow}>
          <View className={styles.avatar}>
            <Image className={styles.avatarImg} src={user.avatar} mode="aspectFill" />
          </View>
          <View className={styles.userInfo}>
            <Text className={styles.userName}>{user.name}</Text>
            <Text className={styles.userCollege}>🏛️ {user.college}</Text>
            <View className={styles.creditBar}>
              <Text className={styles.creditStar}>⭐</Text>
              <Text className={styles.creditText}>
                信用分 {user.creditScore} · 交易{user.tradeCount}次 · 爽约{user.noShowCount}次
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.statsGrid}>
        {stats.map((s, i) => (
          <View
            key={i}
            className={styles.statItem}
            onClick={() => i === 0 && handleMenuClick('orders')}
          >
            <Text className={styles.statNum}>{s.num}</Text>
            <Text className={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionCard}>
          <View className={styles.sectionTitle}>
            <Text>📊 热门教材价格走势</Text>
            <Text className={styles.sectionMore} onClick={() => handleMenuClick('pricechart')}>查看更多 ›</Text>
          </View>
          <View style={{ padding: '0 24rpx 24rpx' }}>
            <PriceTrendChart data={mockPriceHistory} title="近6月同教材均价" />
          </View>
        </View>
      </View>

      {menus.map((group, gi) => (
        <View key={gi} className={styles.section}>
          <View className={styles.sectionCard}>
            <View className={styles.menuList}>
              {group.map((m, mi) => (
                <View
                  key={mi}
                  className={styles.menuItem}
                  onClick={() => handleMenuClick(m.type)}
                >
                  <View className={`${styles.menuIcon} ${m.cls}`}>
                    <Text>{m.icon}</Text>
                  </View>
                  <View className={styles.menuContent}>
                    <Text className={styles.menuTitle}>{m.title}</Text>
                    <Text className={styles.menuDesc}>{m.desc}</Text>
                  </View>
                  <Text className={styles.menuArrow}>›</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      ))}

      <View className={styles.section}>
        <View className={styles.sectionCard}>
          <View className={styles.sectionTitle}>
            <Text>⭐ 我的收藏</Text>
            <Text className={styles.sectionMore} onClick={() => handleMenuClick('favorites')}>全部 ›</Text>
          </View>
          {favBooks.length === 0 ? (
            <EmptyState icon="⭐" title="暂无收藏" desc="去首页逛逛，收藏心仪的教材吧~" />
          ) : (
            <View className={styles.favList}>
              {favBooks.map(book => (
                <View
                  key={book.id}
                  className={styles.favItem}
                >
                  <View
                    className={styles.favCover}
                    onClick={() => Taro.navigateTo({ url: `/pages/detail/index?id=${book.id}` })}
                  >
                    <Image style={{ width: '100%', height: '100%' }} src={book.cover} mode="aspectFill" />
                  </View>
                  <View
                    className={styles.favInfo}
                    onClick={() => Taro.navigateTo({ url: `/pages/detail/index?id=${book.id}` })}
                  >
                    <Text className={styles.favTitle}>{book.title}</Text>
                    <Text className={styles.favMeta}>{book.condition} · {book.course}</Text>
                  </View>
                  <View className={styles.favRight}>
                    <Text className={styles.favPrice}>
                      <Text className={styles.yuan}>¥</Text>{book.price}
                    </Text>
                    {book.availability === 'sold' && (
                      <Text className={classnames(styles.availTag, styles.availSold)}>已售出</Text>
                    )}
                    {book.availability === 'reserved' && (
                      <Text className={classnames(styles.availTag, styles.availReserved)}>已预订</Text>
                    )}
                    {book.availability === 'available' && (
                      <Text
                        className={styles.favBookBtn}
                        onClick={() => Taro.navigateTo({ url: `/pages/appointment/index?id=${book.id}` })}
                      >
                        预约
                      </Text>
                    )}
                    <Text
                      className={styles.favRemove}
                      onClick={() => {
                        toggleFavorite(book.id);
                        Taro.showToast({ title: '已取消收藏', icon: 'success' });
                      }}
                    >
                      取消
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default MinePage;
