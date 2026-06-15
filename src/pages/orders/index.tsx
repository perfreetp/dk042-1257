import React, { useState, useMemo } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { Order, OrderStatus } from '@/types';
import { mockOrders, getOrdersByStatus } from '@/data/orders';
import EmptyState from '@/components/EmptyState';
import styles from './index.module.scss';

const STATUS_TABS: { key: OrderStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'reserved', label: '已预订' },
  { key: 'pending', label: '待取书' },
  { key: 'completed', label: '已完成' },
  { key: 'reviewed', label: '已评价' }
];

const OrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all'>('all');

  const displayedOrders = useMemo(() => {
    if (activeTab === 'all') return mockOrders;
    return getOrdersByStatus(activeTab);
  }, [activeTab]);

  const badgeCount = useMemo(() => {
    return {
      reserved: getOrdersByStatus('reserved').length,
      pending: getOrdersByStatus('pending').length
    };
  }, []);

  const statusDisplay: Record<OrderStatus, { text: string; cls: string }> = {
    reserved: { text: '✓ 已预订', cls: styles.statusReserved },
    pending: { text: '⏰ 待取书', cls: styles.statusPending },
    completed: { text: '📦 交易完成', cls: styles.statusCompleted },
    reviewed: { text: '⭐ 已评价', cls: styles.statusReviewed }
  };

  const handleAction = (action: string, order: Order) => {
    console.log('[Orders] action:', action, 'order:', order.id);
    switch (action) {
      case 'cancel':
        Taro.showModal({
          title: '取消预订',
          content: '确定要取消这笔预订吗？频繁取消可能影响信用。',
          confirmColor: '#f5222d',
          success: (res) => {
            if (res.confirm) {
              Taro.showToast({ title: '已取消预订', icon: 'success' });
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
              Taro.showToast({ title: '交易已完成', icon: 'success' });
            }
          }
        });
        break;
      case 'review':
        Taro.showToast({ title: '评价功能开发中', icon: 'none' });
        break;
      case 'memo':
        Taro.showActionSheet({
          itemList: ['添加交易备忘', '举报盗版嫌疑', '标记爽约记录', '查看价格走势'],
          success: (res) => {
            Taro.showToast({ title: `选择了第${res.tapIndex + 1}项`, icon: 'none' });
          }
        });
        break;
      case 'detail':
        Taro.navigateTo({ url: `/pages/detail/index?id=${order.bookId}` });
        break;
    }
  };

  return (
    <View className={styles.page}>
      <View className={styles.tabsBar}>
        {STATUS_TABS.map(tab => {
          const showBadge = (tab.key === 'reserved' && badgeCount.reserved > 0)
            || (tab.key === 'pending' && badgeCount.pending > 0);
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
              {showBadge && (
                <View className={styles.badge}>
                  <Text>{tab.key === 'reserved' ? badgeCount.reserved : badgeCount.pending}</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      <View className={styles.listArea}>
        {displayedOrders.length === 0 ? (
          <EmptyState
            icon="📋"
            title="暂无订单"
            desc="去首页逛逛，找到心仪的教材吧~"
          />
        ) : (
          displayedOrders.map(order => (
            <View key={order.id} className={styles.orderCard}>
              <View className={styles.cardHeader}>
                <Text className={styles.orderId}>订单号：{order.id}</Text>
                <Text className={classnames(styles.statusText, statusDisplay[order.status].cls)}>
                  {statusDisplay[order.status].text}
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
                        <Text className={styles.appointmentLabel}>交易备忘</Text>
                        <Text>{order.memo}</Text>
                      </View>
                    )}
                  </View>
                )}

                <View className={styles.sellerInfo}>
                  <View className={styles.sellerLeft}>
                    <Image className={styles.sellerAvatar} src={order.seller.avatar} mode="aspectFill" />
                    <Text className={styles.sellerName}>{order.seller.name}</Text>
                    <Text className={styles.sellerCredit}>★{order.seller.creditScore}</Text>
                  </View>
                </View>

                <View className={styles.actionBar}>
                  <Button className={classnames(styles.btn, styles.btnOutline)} onClick={() => handleAction('memo', order)}>
                    更多
                  </Button>
                  {order.status === 'reserved' && (
                    <>
                      <Button className={classnames(styles.btn, styles.btnWarning)} onClick={() => handleAction('cancel', order)}>
                        取消
                      </Button>
                      <Button className={classnames(styles.btn, styles.btnPrimary)} onClick={() => handleAction('detail', order)}>
                        联系卖家
                      </Button>
                    </>
                  )}
                  {order.status === 'pending' && (
                    <Button className={classnames(styles.btn, styles.btnPrimary)} onClick={() => handleAction('confirm', order)}>
                      确认取书
                    </Button>
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
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

export default OrdersPage;
