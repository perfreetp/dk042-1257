import React, { useState, useMemo } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { Order, OrderStatus } from '@/types';
import { useAppStore } from '@/store/app';
import EmptyState from '@/components/EmptyState';
import styles from './index.module.scss';

const STATUS_TABS: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'reserved', label: '待确认' },
  { key: 'approved', label: '已同意' },
  { key: 'pending', label: '待取书' },
  { key: 'completed', label: '已完成' },
  { key: 'reviewed', label: '已评价' }
];

const buyerStatusText: Record<OrderStatus, { text: string; cls: string }> = {
  reserved: { text: '🕐 等待卖家确认', cls: styles.statusReserved },
  approved: { text: '✓ 卖家已同意', cls: styles.statusApproved },
  pending: { text: '⏰ 待取书', cls: styles.statusPending },
  completed: { text: '📦 交易完成', cls: styles.statusCompleted },
  reviewed: { text: '⭐ 已评价', cls: styles.statusReviewed },
  rejected: { text: '✕ 卖家已拒绝', cls: styles.statusRejected }
};

const sellerStatusText: Record<OrderStatus, { text: string; cls: string }> = {
  reserved: { text: '🔔 新订单待处理', cls: styles.statusReserved },
  approved: { text: '✓ 已同意待确认', cls: styles.statusApproved },
  pending: { text: '⏰ 待买家取书', cls: styles.statusPending },
  completed: { text: '📦 交易完成', cls: styles.statusCompleted },
  reviewed: { text: '⭐ 买家已评价', cls: styles.statusReviewed },
  rejected: { text: '✕ 已拒绝', cls: styles.statusRejected }
};

const timelineIcon: Record<string, string> = {
  reserved: '📝',
  approved: '✅',
  pending: '🤝',
  completed: '📦',
  reviewed: '⭐',
  rejected: '❌'
};

const OrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');
  const [viewMode, setViewMode] = useState<'all' | 'buyer' | 'seller'>('all');
  const {
    orders, cancelOrder, approveOrder, rejectOrder,
    rescheduleOrder, markPending, confirmPickup,
    reviewOrder, updateOrderMemo, isBuyer, isSeller, getOrderRole
  } = useAppStore();

  const filteredOrders = useMemo(() => {
    let list = orders.filter(o => o.status !== 'rejected');
    if (viewMode === 'buyer') {
      list = list.filter(o => isBuyer(o));
    } else if (viewMode === 'seller') {
      list = list.filter(o => isSeller(o));
    }
    if (activeTab === 'all') return list;
    return list.filter(o => o.status === activeTab);
  }, [orders, activeTab, viewMode, isBuyer, isSeller]);

  const badgeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    STATUS_TABS.forEach(tab => {
      let list = orders.filter(o => o.status !== 'rejected');
      if (viewMode === 'buyer') list = list.filter(o => isBuyer(o));
      if (viewMode === 'seller') list = list.filter(o => isSeller(o));
      if (tab.key === 'all') {
        counts['all'] = list.length;
      } else {
        counts[tab.key] = list.filter(o => o.status === tab.key).length;
      }
    });
    return counts;
  }, [orders, viewMode, isBuyer, isSeller]);

  const handleAction = (action: string, order: Order) => {
    const role = getOrderRole(order);
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
        approveOrder(order.id);
        Taro.showToast({ title: '已同意预约', icon: 'success' });
        break;
      case 'approve_reschedule':
        Taro.showModal({
          title: '同意并调整时间',
          content: '同意买家预约，但需要调整时间/地点？',
          confirmText: '调整时间',
          cancelText: '直接同意',
          confirmColor: '#2B7FFF',
          success: (res) => {
            if (res.confirm) {
              const book = require('@/data/books').getBookById(order.bookId);
              const locations = book?.pickupLocations || ['东校区图书馆'];
              Taro.showActionSheet({
                itemList: locations,
                success: (locRes) => {
                  const newTime = '2026-06-20 15:00';
                  approveOrder(order.id, newTime, locations[locRes.tapIndex]);
                  Taro.showToast({ title: '已同意并改约', icon: 'success' });
                }
              });
            } else {
              approveOrder(order.id);
              Taro.showToast({ title: '已同意预约', icon: 'success' });
            }
          }
        });
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
              rejectOrder(order.id, res.content || undefined);
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
      case 'review':
        Taro.showActionSheet({
          itemList: ['⭐ 好评（5星）', '👍 中评（3星）', '👎 差评（1星）'],
          success: () => {
            reviewOrder(order.id);
            Taro.showToast({ title: '评价成功', icon: 'success' });
          }
        });
        break;
      case 'reschedule':
        Taro.showModal({
          title: '改约时间地点',
          editable: true,
          placeholderText: '如：2026-06-20 15:00 南门快递点',
          content: '',
          success: (res) => {
            if (res.confirm && res.content) {
              const parts = res.content.split(/\s+/);
              const newTime = parts[0] || order.appointmentTime || '';
              const newLocation = parts.slice(1).join(' ') || order.pickupLocation || '';
              rescheduleOrder(order.id, newTime, newLocation);
              Taro.showToast({ title: '已改约', icon: 'success' });
            }
          }
        });
        break;
      case 'memo':
        Taro.showActionSheet({
          itemList: ['添加交易备忘', '举报盗版嫌疑', '标记爽约记录', '查看价格走势'],
          success: (res) => {
            if (res.tapIndex === 0) {
              Taro.showModal({
                title: '添加交易备忘',
                editable: true,
                placeholderText: '记录重要交易信息',
                content: order.memo || '',
                success: (result) => {
                  if (result.confirm && result.content) {
                    updateOrderMemo(order.id, result.content);
                    Taro.showToast({ title: '备忘已保存', icon: 'success' });
                  }
                }
              });
            } else if (res.tapIndex === 1) {
              Taro.showToast({ title: '举报已提交', icon: 'success' });
            } else if (res.tapIndex === 2) {
              Taro.showToast({ title: '已记录爽约标记', icon: 'none' });
            } else if (res.tapIndex === 3) {
              Taro.navigateTo({ url: '/pages/pricechart/index' });
            }
          }
        });
        break;
      case 'detail':
        Taro.navigateTo({ url: `/pages/detail/index?id=${order.bookId}` });
        break;
      case 'contact':
        Taro.showActionSheet({
          itemList: ['复制微信号', '复制手机号', '发起站内消息'],
          success: (res) => {
            Taro.setClipboardData({ data: 'test_contact_123', success: () => Taro.showToast({ title: '已复制', icon: 'success' }) });
          }
        });
        break;
    }
  };

  const getStatusText = (order: Order) => {
    return isSeller(order) ? sellerStatusText[order.status] : buyerStatusText[order.status];
  };

  const renderActionBar = (order: Order) => {
    const role = getOrderRole(order);
    const isSellerRole = role === 'seller';

    return (
      <View className={styles.actionBar}>
        <Button className={classnames(styles.btn, styles.btnOutline)} onClick={() => handleAction('memo', order)}>
          更多
        </Button>
        {role === 'buyer' && (
          <>
            {order.status === 'reserved' && (
              <Button className={classnames(styles.btn, styles.btnWarning)} onClick={() => handleAction('cancel', order)}>
                取消
              </Button>
            )}
            {order.status === 'approved' && (
              <>
                <Button className={classnames(styles.btn, styles.btnPrimary)} onClick={() => handleAction('confirm_arrival', order)}>
                  确认约好
                </Button>
                <Button className={classnames(styles.btn, styles.btnOutline)} onClick={() => handleAction('contact', order)}>
                  联系卖家
                </Button>
                <Button className={classnames(styles.btn, styles.btnWarning)} onClick={() => handleAction('cancel', order)}>
                  取消
                </Button>
              </>
            )}
            {order.status === 'pending' && (
              <>
                <Button className={classnames(styles.btn, styles.btnPrimary)} onClick={() => handleAction('confirm', order)}>
                  确认取书
                </Button>
                <Button className={classnames(styles.btn, styles.btnOutline)} onClick={() => handleAction('reschedule', order)}>
                  改约
                </Button>
              </>
            )}
            {order.status === 'completed' && (
              <Button className={classnames(styles.btn, styles.btnPrimary)} onClick={() => handleAction('review', order)}>
                去评价
              </Button>
            )}
            {order.status === 'reviewed' && (
              <Button className={classnames(styles.btn, styles.btnOutline)} onClick={() => handleAction('detail', order)}>
                再看看
              </Button>
            )}
          </>
        )}
        {role === 'seller' && (
          <>
            {order.status === 'reserved' && (
              <>
                <Button className={classnames(styles.btn, styles.btnSuccess)} onClick={() => handleAction('approve', order)}>
                  同意
                </Button>
                <Button className={classnames(styles.btn, styles.btnPrimary)} onClick={() => handleAction('approve_reschedule', order)}>
                  同意改约
                </Button>
                <Button className={classnames(styles.btn, styles.btnWarning)} onClick={() => handleAction('reject', order)}>
                  拒绝
                </Button>
              </>
            )}
            {order.status === 'approved' && (
              <>
                <Button className={classnames(styles.btn, styles.btnOutline)} onClick={() => handleAction('contact', order)}>
                  联系买家
                </Button>
                <Button className={classnames(styles.btn, styles.btnOutline)} onClick={() => handleAction('reschedule', order)}>
                  改约
                </Button>
              </>
            )}
            {order.status === 'pending' && (
              <>
                <Button className={classnames(styles.btn, styles.btnPrimary)} onClick={() => handleAction('confirm_seller', order)}>
                  确认已取书
                </Button>
                <Button className={classnames(styles.btn, styles.btnOutline)} onClick={() => handleAction('reschedule', order)}>
                  改约
                </Button>
              </>
            )}
            {(order.status === 'completed' || order.status === 'reviewed') && (
              <Button className={classnames(styles.btn, styles.btnOutline)} onClick={() => handleAction('detail', order)}>
                查看详情
              </Button>
            )}
          </>
        )}
      </View>
    );
  };

  return (
    <View className={styles.page}>
      <View className={styles.viewSwitcher}>
        <View
          className={classnames(styles.viewTab, viewMode === 'all' && styles.activeViewTab)}
          onClick={() => setViewMode('all')}
        >
          <Text>全部</Text>
        </View>
        <View
          className={classnames(styles.viewTab, viewMode === 'buyer' && styles.activeViewTab)}
          onClick={() => setViewMode('buyer')}
        >
          <Text>我买的</Text>
        </View>
        <View
          className={classnames(styles.viewTab, viewMode === 'seller' && styles.activeViewTab)}
          onClick={() => setViewMode('seller')}
        >
          <Text>我卖的</Text>
        </View>
      </View>

      <ScrollView className={styles.tabsBar} scrollX>
        {STATUS_TABS.map(tab => {
          const count = badgeCounts[tab.key] || 0;
          return (
            <View
              key={tab.key}
              className={classnames(
                styles.tabItem,
                activeTab === tab.key && styles.activeTab
              )}
              onClick={() => setActiveTab(tab.key)}
            >
              <Text>{tab.label}</Text>
              {count > 0 && (
                <View className={styles.badge}>
                  <Text>{count}</Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <ScrollView className={styles.listArea} scrollY>
        {filteredOrders.length === 0 ? (
          <EmptyState
            icon="📋"
            title="暂无订单"
            desc={viewMode === 'seller' ? '还没有买家预约你的教材，去首页逛逛吧~' : '去首页逛逛，找到心仪的教材吧~'}
          />
        ) : (
          filteredOrders.map(order => {
            const statusInfo = getStatusText(order);
            const isSellerRole = isSeller(order);
            const counterParty = isSellerRole ? order.buyer : order.seller;
            return (
              <View key={order.id} className={styles.orderCard}>
                <View className={styles.cardHeader}>
                  <Text className={styles.orderId}>订单号：{order.id} · {isSellerRole ? '我是卖家' : '我是买家'}</Text>
                  <Text className={classnames(styles.statusText, statusInfo?.cls)}>
                    {statusInfo?.text}
                  </Text>
                </View>

                <View className={styles.cardBody}>
                  <View className={styles.bookCover} onClick={() => handleAction('detail', order)}>
                    <Image className={styles.coverImg} src={order.bookCover} mode="aspectFill" />
                  </View>
                  <View className={styles.bookInfo}>
                    <View>
                      <Text className={styles.bookTitle}>{order.bookTitle}</Text>
                      <View className={styles.bookMeta}>
                        <Text className={styles.conditionTag}>{order.condition}</Text>
                        {order.bargainPrice && (
                          <Text className={styles.conditionTag} style={{ backgroundColor: 'rgba(255,125,0,0.1)', color: '#ff7d00' }}>
                            砍价后
                          </Text>
                        )}
                      </View>
                    </View>
                    <View>
                      <Text className={styles.priceTag}>
                        <Text className={styles.yuan}>¥</Text>{order.bargainPrice || order.bookPrice}
                      </Text>
                      <Text className={styles.originalPrice}>原价 ¥{order.bookPrice}</Text>
                    </View>
                  </View>
                </View>

                <View className={styles.cardFooter}>
                  {(order.appointmentTime || order.pickupLocation) && (
                    <View className={styles.appointment}>
                      {order.appointmentTime && (
                        <View className={styles.appointmentRow}>
                          <Text className={styles.appointmentLabel}>取书时间</Text>
                          <Text>{order.appointmentTime}</Text>
                        </View>
                      )}
                      {order.pickupLocation && (
                        <View className={styles.appointmentRow}>
                          <Text className={styles.appointmentLabel}>取书地点</Text>
                          <Text>{order.pickupLocation}</Text>
                        </View>
                      )}
                      {order.memo && (
                        <View className={styles.appointmentRow}>
                          <Text className={styles.appointmentLabel}>备忘</Text>
                          <Text>{order.memo}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  <View className={styles.counterParty}>
                    <View className={styles.partyLeft}>
                      <Image className={styles.partyAvatar} src={counterParty.avatar} mode="aspectFill" />
                      <View className={styles.partyInfo}>
                        <Text className={styles.partyName}>{counterParty.name}</Text>
                        <Text className={styles.partySub}>
                          {isSellerRole ? '买家' : '卖家'} · ★{counterParty.creditScore}
                        </Text>
                      </View>
                    </View>
                    <Button
                      className={classnames(styles.btn, styles.btnOutline, styles.contactBtn)}
                      onClick={() => handleAction('contact', order)}
                    >
                      联系
                    </Button>
                  </View>

                  {order.timeline.length > 0 && (
                    <View className={styles.timelineSection}>
                      <Text className={styles.timelineTitle}>交易进度</Text>
                      {order.timeline.map((node, idx) => (
                        <View key={idx} className={styles.timelineItem}>
                          <View className={styles.timelineLeft}>
                            <Text className={styles.timelineIcon}>{timelineIcon[node.status] || '📌'}</Text>
                            {idx < order.timeline.length - 1 && <View className={styles.timelineLine} />}
                          </View>
                          <View className={styles.timelineRight}>
                            <View className={styles.timelineRow}>
                              <Text className={styles.timelineLabel}>{node.label}</Text>
                              <Text className={styles.timelineTime}>{node.time}</Text>
                            </View>
                            {node.desc && <Text className={styles.timelineDesc}>{node.desc}</Text>}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {renderActionBar(order)}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

export default OrdersPage;
