import React, { useState, useMemo } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { mockCurrentUser } from '@/data/users';
import { getBookById, mockPriceHistory } from '@/data/books';
import BookCard from '@/components/BookCard';
import PriceTrendChart from '@/components/PriceTrendChart';
import EmptyState from '@/components/EmptyState';
import { useAppStore } from '@/store/app';
import type { Book, Order, OrderStatus } from '@/types';
import styles from './index.module.scss';

interface OrderGroup {
  key: string;
  label: string;
  icon: string;
  filter: (o: Order) => boolean;
}

const ORDER_GROUPS: OrderGroup[] = [
  { key: 'in_progress', label: '进行中', icon: '📝', filter: o => ['reserved', 'approved'].includes(o.status) },
  { key: 'pending', label: '待取书', icon: '⏰', filter: o => o.status === 'pending' },
  { key: 'completed', label: '已完成', icon: '📦', filter: o => o.status === 'completed' },
  { key: 'reviewed', label: '已评价', icon: '⭐', filter: o => o.status === 'reviewed' }
];

const timelineIcon: Record<string, string> = {
  reserved: '📝',
  approved: '✅',
  pending: '🤝',
  completed: '📦',
  reviewed: '⭐',
  rejected: '❌'
};

const buyerStatusText: Record<OrderStatus, string> = {
  reserved: '待卖家确认',
  approved: '卖家已同意',
  pending: '待取书',
  completed: '交易完成',
  reviewed: '已评价',
  rejected: '已拒绝'
};

const sellerStatusText: Record<OrderStatus, string> = {
  reserved: '新订单待处理',
  approved: '已同意待确认',
  pending: '待买家取书',
  completed: '交易完成',
  reviewed: '买家已评价',
  rejected: '已拒绝'
};

const MinePage: React.FC = () => {
  const user = mockCurrentUser;
  const {
    favoriteBookIds, toggleFavorite, orders, getBookAvailability,
    getMyPublishedBooks, getBookOrders, getOrderRole,
    confirmPickup, reviewOrder, markPending, cancelOrder
  } = useAppStore();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const favBooks = useMemo(() => {
    return favoriteBookIds
      .map(id => {
        const book = getBookById(id);
        if (!book) return null;
        return { ...book, availability: getBookAvailability(id) };
      })
      .filter(Boolean) as (Book & { availability: 'available' | 'reserved' | 'sold' })[];
  }, [favoriteBookIds, orders]);

  const myOrders = useMemo(() => {
    return orders.filter(o => (o.buyer.id === user.id || o.seller.id === user.id) && o.status !== 'rejected');
  }, [orders]);

  const publishedBooks = useMemo(() => {
    return getMyPublishedBooks().map(book => ({
      ...book,
      availability: getBookAvailability(book.id),
      orders: getBookOrders(book.id)
    }));
  }, [orders]);

  const groupedOrders = useMemo(() => {
    const groups: Record<string, Order[]> = {};
    ORDER_GROUPS.forEach(g => {
      groups[g.key] = myOrders.filter(g.filter);
    });
    return groups;
  }, [myOrders]);

  const stats = [
    { num: myOrders.length, label: '全部订单', type: 'orders' },
    { num: user.tradeCount, label: '交易次数', type: '' },
    { num: favBooks.length, label: '我的收藏', type: 'favorites' },
    { num: publishedBooks.length, label: '发布中', type: 'publish' }
  ];

  const toggleExpand = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

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

  const handleOrderAction = (action: string, order: Order) => {
    switch (action) {
      case 'cancel':
        Taro.showModal({
          title: '取消预订',
          content: '确定要取消这笔预订吗？频繁取消可能影响信用。',
          confirmColor: '#f5222d',
          success: (res) => {
            if (res.confirm) {
              cancelOrder(order.id);
              Taro.showToast({ title: '已取消预订', icon: 'success' });
            }
          }
        });
        break;
      case 'approve':
        useAppStore.getState().approveOrder(order.id);
        Taro.showToast({ title: '已同意预约', icon: 'success' });
        break;
      case 'reject':
        Taro.showModal({
          title: '拒绝预约',
          content: '确定要拒绝买家的预约请求吗？',
          confirmColor: '#f5222d',
          editable: true,
          placeholderText: '可以输入拒绝原因（选填）',
          success: (res) => {
            if (res.confirm) {
              useAppStore.getState().rejectOrder(order.id, res.content || undefined);
              Taro.showToast({ title: '已拒绝预约', icon: 'success' });
            }
          }
        });
        break;
      case 'confirm_arrival':
        Taro.showModal({
          title: '确认约好取书',
          content: '确认卖家已联系，取书时间地点已约定好，订单将进入"待取书"状态。',
          confirmColor: '#2B7FFF',
          success: (res) => {
            if (res.confirm) {
              markPending(order.id);
              Taro.showToast({ title: '已推进至待取书', icon: 'success' });
            }
          }
        });
        break;
      case 'confirm':
        Taro.showModal({
          title: '确认取书',
          content: '请确认已线下拿到书并完成交易，确认后订单将完成。',
          confirmColor: '#00b42a',
          success: (res) => {
            if (res.confirm) {
              confirmPickup(order.id);
              Taro.showToast({ title: '交易已完成', icon: 'success' });
            }
          }
        });
        break;
      case 'confirm_seller':
        Taro.showModal({
          title: '确认买家已取书',
          content: '确认买家已线下取书并付款，订单将完成。',
          confirmColor: '#00b42a',
          success: (res) => {
            if (res.confirm) {
              confirmPickup(order.id);
              Taro.showToast({ title: '交易已完成', icon: 'success' });
            }
          }
        });
        break;
      case 'review':
        Taro.showActionSheet({
          itemList: ['⭐ 好评（5星）', '👍 中评（3星）', '👎 差评（1星）'],
          success: () => {
            reviewOrder(order.id);
            Taro.showToast({ title: '评价成功', icon: 'success' });
          }
        });
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

  const renderOrderCard = (order: Order) => {
    const isExpanded = expandedOrderId === order.id;
    const role = getOrderRole(order);
    const isSellerRole = role === 'seller';
    const counterParty = isSellerRole ? order.buyer : order.seller;
    const statusText = isSellerRole ? sellerStatusText : buyerStatusText;

    return (
      <View key={order.id} className={styles.orderMiniCard} onClick={() => toggleExpand(order.id)}>
        <View className={styles.orderMiniHeader}>
          <Image className={styles.orderMiniCover} src={order.bookCover} mode="aspectFill" />
          <View className={styles.orderMiniInfo}>
            <Text className={styles.orderMiniTitle}>{order.bookTitle}</Text>
            <View className={styles.orderMiniMeta}>
              <Text className={styles.orderMiniPrice}>¥{order.bargainPrice || order.bookPrice}</Text>
              <Text className={styles.orderMiniStatus}>{statusText[order.status]}</Text>
            </View>
          </View>
          <Text className={styles.orderArrow}>{isExpanded ? '▼' : '▶'}</Text>
        </View>

        {isExpanded && (
          <View className={styles.orderExpand}>
            {(order.appointmentTime || order.pickupLocation) && (
              <View className={styles.expandAppointment}>
                {order.appointmentTime && (
                  <View className={styles.expandRow}>
                    <Text className={styles.expandLabel}>取书时间</Text>
                    <Text>{order.appointmentTime}</Text>
                  </View>
                )}
                {order.pickupLocation && (
                  <View className={styles.expandRow}>
                    <Text className={styles.expandLabel}>取书地点</Text>
                    <Text>{order.pickupLocation}</Text>
                  </View>
                )}
                {order.memo && (
                  <View className={styles.expandRow}>
                    <Text className={styles.expandLabel}>备忘</Text>
                    <Text>{order.memo}</Text>
                  </View>
                )}
              </View>
            )}

            <View className={styles.expandParty}>
              <View className={styles.expandPartyLeft}>
                <Image className={styles.expandAvatar} src={counterParty.avatar} mode="aspectFill" />
                <View>
                  <Text className={styles.expandName}>{counterParty.name}</Text>
                  <Text className={styles.expandSub}>
                    {isSellerRole ? '买家' : '卖家'} · ★{counterParty.creditScore}
                  </Text>
                </View>
              </View>
              <Button
                className={classnames(styles.btn, styles.btnOutline, styles.btnSmall)}
                onClick={(e) => {
                  e.stopPropagation();
                  Taro.setClipboardData({ data: 'contact_123', success: () => Taro.showToast({ title: '已复制联系方式', icon: 'success' }) });
                }}
              >
                联系
              </Button>
            </View>

            {order.timeline.length > 0 && (
              <View className={styles.expandTimeline}>
                {order.timeline.map((node, idx) => (
                  <View key={idx} className={styles.timelineMiniItem}>
                    <View className={styles.timelineMiniLeft}>
                      <Text>{timelineIcon[node.status] || '📌'}</Text>
                      {idx < order.timeline.length - 1 && <View className={styles.timelineMiniLine} />}
                    </View>
                    <View className={styles.timelineMiniRight}>
                      <View className={styles.timelineMiniRow}>
                        <Text className={styles.timelineMiniLabel}>{node.label}</Text>
                        <Text className={styles.timelineMiniTime}>{node.time}</Text>
                      </View>
                      {node.desc && <Text className={styles.timelineMiniDesc}>{node.desc}</Text>}
                    </View>
                  </View>
                ))}
              </View>
            )}

            <View className={styles.expandActions}>
              <Button
                className={classnames(styles.btn, styles.btnOutline, styles.btnSmall)}
                onClick={(e) => {
                  e.stopPropagation();
                  Taro.navigateTo({ url: `/pages/detail/index?id=${order.bookId}` });
                }}
              >
                查看教材
              </Button>
              {role === 'buyer' && (
                <>
                  {order.status === 'reserved' && (
                    <Button
                      className={classnames(styles.btn, styles.btnWarning, styles.btnSmall)}
                      onClick={(e) => { e.stopPropagation(); handleOrderAction('cancel', order); }}
                    >
                      取消预订
                    </Button>
                  )}
                  {order.status === 'approved' && (
                    <Button
                      className={classnames(styles.btn, styles.btnPrimary, styles.btnSmall)}
                      onClick={(e) => { e.stopPropagation(); handleOrderAction('confirm_arrival', order); }}
                    >
                      确认约好
                    </Button>
                  )}
                  {order.status === 'pending' && (
                    <Button
                      className={classnames(styles.btn, styles.btnPrimary, styles.btnSmall)}
                      onClick={(e) => { e.stopPropagation(); handleOrderAction('confirm', order); }}
                    >
                      确认取书
                    </Button>
                  )}
                  {order.status === 'completed' && (
                    <Button
                      className={classnames(styles.btn, styles.btnPrimary, styles.btnSmall)}
                      onClick={(e) => { e.stopPropagation(); handleOrderAction('review', order); }}
                    >
                      去评价
                    </Button>
                  )}
                </>
              )}
              {role === 'seller' && (
                <>
                  {order.status === 'reserved' && (
                    <>
                      <Button
                        className={classnames(styles.btn, styles.btnSuccess, styles.btnSmall)}
                        onClick={(e) => { e.stopPropagation(); handleOrderAction('approve', order); }}
                      >
                        同意
                      </Button>
                      <Button
                        className={classnames(styles.btn, styles.btnWarning, styles.btnSmall)}
                        onClick={(e) => { e.stopPropagation(); handleOrderAction('reject', order); }}
                      >
                        拒绝
                      </Button>
                    </>
                  )}
                  {order.status === 'pending' && (
                    <Button
                      className={classnames(styles.btn, styles.btnPrimary, styles.btnSmall)}
                      onClick={(e) => { e.stopPropagation(); handleOrderAction('confirm_seller', order); }}
                    >
                      确认已取书
                    </Button>
                  )}
                </>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

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
            onClick={() => s.type && handleMenuClick(s.type)}
          >
            <Text className={styles.statNum}>{s.num}</Text>
            <Text className={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionCard}>
          <View className={styles.sectionTitle}>
            <Text>📋 我的交易</Text>
            <Text className={styles.sectionMore} onClick={() => handleMenuClick('orders')}>全部订单 ›</Text>
          </View>
          {myOrders.length === 0 ? (
            <EmptyState icon="📋" title="暂无交易记录" desc="去首页逛逛，找到心仪的教材吧~" />
          ) : (
            ORDER_GROUPS.map(group => {
              const list = groupedOrders[group.key] || [];
              if (list.length === 0) return null;
              return (
                <View key={group.key} className={styles.orderGroup}>
                  <View className={styles.orderGroupHeader}>
                    <Text className={styles.orderGroupIcon}>{group.icon}</Text>
                    <Text className={styles.orderGroupLabel}>{group.label}</Text>
                    <View className={styles.orderGroupBadge}>
                      <Text>{list.length}</Text>
                    </View>
                  </View>
                  <View className={styles.orderGroupList}>
                    {list.map(order => renderOrderCard(order))}
                  </View>
                </View>
              );
            })
          )}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionCard}>
          <View className={styles.sectionTitle}>
            <Text>📤 我的发布</Text>
            <Text className={styles.sectionMore} onClick={() => handleMenuClick('publish')}>发布新教材 ›</Text>
          </View>
          {publishedBooks.length === 0 ? (
            <EmptyState icon="📤" title="还没有发布教材" desc="闲置教材也能变现，快去发布吧~" />
          ) : (
            <View className={styles.publishList}>
              {publishedBooks.map(book => (
                <View key={book.id} className={styles.publishItem}>
                  <View
                    className={styles.publishCover}
                    onClick={() => Taro.navigateTo({ url: `/pages/detail/index?id=${book.id}` })}
                  >
                    <Image style={{ width: '100%', height: '100%' }} src={book.cover} mode="aspectFill" />
                  </View>
                  <View className={styles.publishInfo}>
                    <Text className={styles.publishTitle}>{book.title}</Text>
                    <Text className={styles.publishMeta}>{book.condition} · {book.course}</Text>
                    <View className={styles.publishStatusRow}>
                      {book.availability === 'available' && (
                        <Text className={classnames(styles.publishTag, styles.tagAvailable)}>在售中</Text>
                      )}
                      {book.availability === 'reserved' && (
                        <Text className={classnames(styles.publishTag, styles.tagReserved)}>已被预约</Text>
                      )}
                      {book.availability === 'sold' && (
                        <Text className={classnames(styles.publishTag, styles.tagSold)}>已售出</Text>
                      )}
                      <Text className={styles.publishPrice}>¥{book.price}</Text>
                    </View>
                    {book.orders.length > 0 && (
                      <Text
                        className={styles.publishOrders}
                        onClick={() => Taro.switchTab({ url: '/pages/orders/index' })}
                      >
                        有 {book.orders.length} 条相关订单 ›
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
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
