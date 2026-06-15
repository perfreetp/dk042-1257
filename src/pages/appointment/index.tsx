import React, { useState, useMemo } from 'react';
import { View, Text, Image, Textarea, Button, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { getBookById } from '@/data/books';
import type { Book, Order, OrderStatus } from '@/types';
import { useAppStore } from '@/store/app';
import EmptyState from '@/components/EmptyState';
import styles from './index.module.scss';

const timeSlots = [
  '09:00 - 10:00',
  '10:00 - 11:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '19:00 - 20:00'
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

const AppointmentPage: React.FC = () => {
  const router = useRouter();
  const bookId = router.params.id;
  const book: Book | undefined = useMemo(() => (bookId ? getBookById(bookId) : undefined), [bookId]);

  const {
    createOrder, orders, getOrderRole, isBuyer, isSeller,
    approveOrder, rejectOrder, markPending, confirmPickup, cancelOrder
  } = useAppStore();

  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [memo, setMemo] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [viewMode, setViewMode] = useState<'buyer' | 'seller'>('buyer');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const dates = useMemo(() => {
    const result = [];
    const today = new Date();
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      result.push({
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        weekDay: i === 0 ? '今天' : i === 1 ? '明天' : weekDays[d.getDay()],
        fullDate: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
      });
    }
    return result;
  }, []);

  const myBuyerOrders = useMemo(() => {
    return orders.filter(o => isBuyer(o) && o.status !== 'rejected');
  }, [orders]);

  const mySellerOrders = useMemo(() => {
    return orders.filter(o => isSeller(o) && o.status !== 'rejected');
  }, [orders]);

  const displayedOrders = viewMode === 'buyer' ? myBuyerOrders : mySellerOrders;
  const pendingCount = mySellerOrders.filter(o => o.status === 'reserved').length;

  const appointmentDateTime = useMemo(() => {
    if (!selectedTime || selectedDate < 0) return '';
    return `${dates[selectedDate].fullDate} ${selectedTime.split(' - ')[0]}`;
  }, [selectedDate, selectedTime, dates]);

  const canSubmit = selectedTime && selectedLocation;

  const toggleExpand = (oId: string) => {
    setExpandedOrderId(expandedOrderId === oId ? null : oId);
  };

  const handleSubmit = () => {
    if (!book) return;
    if (!selectedTime) {
      Taro.showToast({ title: '请选择取书时间', icon: 'none' });
      return;
    }
    if (!selectedLocation) {
      Taro.showToast({ title: '请选择取书地点', icon: 'none' });
      return;
    }

    const newOrder = createOrder(bookId!, {
      appointmentTime: appointmentDateTime,
      pickupLocation: selectedLocation,
      memo: memo || undefined
    });

    setOrderId(newOrder.id);
    setSubmitted(true);
    Taro.showToast({ title: '预约成功', icon: 'success' });
  };

  const handleViewOrder = () => {
    Taro.switchTab({ url: '/pages/orders/index' });
  };

  const handleReset = () => {
    setSubmitted(false);
    setSelectedDate(0);
    setSelectedTime('');
    setSelectedLocation('');
    setMemo('');
  };

  const handleOrderAction = (action: string, order: Order) => {
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
    }
  };

  const renderOrderCard = (order: Order) => {
    const isExpanded = expandedOrderId === order.id;
    const role = getOrderRole(order);
    const isSellerRole = role === 'seller';
    const statusText = isSellerRole ? sellerStatusText[order.status] : buyerStatusText[order.status];

    return (
      <View key={order.id} className={styles.orderCard} onClick={() => toggleExpand(order.id)}>
        <View className={styles.orderHeader}>
          <Image className={styles.orderCover} src={order.bookCover} mode="aspectFill" />
          <View className={styles.orderInfo}>
            <Text className={styles.orderTitle}>{order.bookTitle}</Text>
            <View className={styles.orderMeta}>
              <Text className={styles.orderPrice}>¥{order.bargainPrice || order.bookPrice}</Text>
              <Text className={styles.orderStatus}>{statusText}</Text>
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
                    <Text className={styles.expandLabel}>备注</Text>
                    <Text>{order.memo}</Text>
                  </View>
                )}
              </View>
            )}

            {order.timeline.length > 0 && (
              <View className={styles.expandTimeline}>
                <Text className={styles.expandTimelineTitle}>交易进度</Text>
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
                      取消
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

  if (!bookId) {
    return (
      <ScrollView className={styles.page} scrollY>
        <View className={styles.listHeader}>
          <Text className={styles.listTitle}>📅 预约验书</Text>
          <Text className={styles.listDesc}>管理你的预约记录和待处理事项</Text>
        </View>

        <View className={styles.viewSwitcher}>
          <View
            className={classnames(styles.viewTab, viewMode === 'buyer' && styles.activeViewTab)}
            onClick={() => setViewMode('buyer')}
          >
            <Text>我发起的</Text>
            {myBuyerOrders.length > 0 && (
              <View className={styles.viewBadge}><Text>{myBuyerOrders.length}</Text></View>
            )}
          </View>
          <View
            className={classnames(styles.viewTab, viewMode === 'seller' && styles.activeViewTab)}
            onClick={() => setViewMode('seller')}
          >
            <Text>我收到的</Text>
            {pendingCount > 0 && (
              <View className={styles.viewBadgeDot}><Text>{pendingCount}</Text></View>
            )}
          </View>
        </View>

        <View className={styles.listSection}>
          {displayedOrders.length === 0 ? (
            <EmptyState
              icon="📅"
              title={viewMode === 'buyer' ? '暂无预约记录' : '暂无待处理预约'}
              desc={viewMode === 'buyer' ? '去首页逛逛，发起第一笔预约吧~' : '还没有买家预约你的教材~'}
            />
          ) : (
            <View className={styles.orderList}>
              {displayedOrders.map(order => renderOrderCard(order))}
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  if (!book) {
    return (
      <View className={styles.page}>
        <EmptyState icon="📖" title="教材不存在" desc="该教材可能已下架" />
      </View>
    );
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.bookCard}>
        <Image className={styles.bookCover} src={book.cover} mode="aspectFill" />
        <View className={styles.bookInfo}>
          <Text className={styles.bookTitle}>{book.title}</Text>
          <Text className={styles.bookMeta}>{book.author} · {book.publisher}</Text>
          <View className={styles.sellerRow}>
            <Text className={styles.sellerName}>卖家：{book.seller.name}</Text>
            <Text className={styles.sellerCredit}>★{book.seller.creditScore}</Text>
          </View>
          <Text className={styles.price}>
            <Text className={styles.yuan}>¥</Text>{book.price}
          </Text>
        </View>
      </View>

      {!submitted ? (
        <>
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>📅 选择取书日期</Text>
            <ScrollView className={styles.dateScroll} scrollX>
              {dates.map((d, i) => (
                <View
                  key={i}
                  className={classnames(
                    styles.dateItem,
                    selectedDate === i && styles.dateItemActive
                  )}
                  onClick={() => setSelectedDate(i)}
                >
                  <Text className={styles.dateWeekDay}>{d.weekDay}</Text>
                  <Text className={styles.dateText}>{d.date}</Text>
                </View>
              ))}
            </ScrollView>
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>⏰ 选择时间段</Text>
            <View className={styles.timeGrid}>
              {timeSlots.map(time => (
                <View
                  key={time}
                  className={classnames(
                    styles.timeItem,
                    selectedTime === time && styles.timeItemActive
                  )}
                  onClick={() => setSelectedTime(time)}
                >
                  <Text>{time}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>📍 选择取书地点</Text>
            <View className={styles.locationList}>
              {book.pickupLocations.map((loc, i) => (
                <View
                  key={i}
                  className={classnames(
                    styles.locationItem,
                    selectedLocation === loc && styles.locationItemActive
                  )}
                  onClick={() => setSelectedLocation(loc)}
                >
                  <View className={styles.locationCheck}>
                    <Text className={styles.checkIcon}>
                      {selectedLocation === loc ? '✓' : ''}
                    </Text>
                  </View>
                  <Text className={styles.locationText}>{loc}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>📝 备注（选填）</Text>
            <Textarea
              className={styles.textarea}
              placeholder="可以备注一些特殊要求，比如需要带复习资料、约在哪个门等等~"
              value={memo}
              onInput={(e: any) => setMemo(e.detail.value)}
              maxlength={200}
            />
          </View>

          <View className={styles.tipBox}>
            <Text className={styles.tipTitle}>💡 温馨提示</Text>
            <View className={styles.tipItem}>
              <Text className={styles.tipDot}>•</Text>
              <Text>请准时到达约定地点，如有变动请提前联系卖家</Text>
            </View>
            <View className={styles.tipItem}>
              <Text className={styles.tipDot}>•</Text>
              <Text>建议当面验书，确认品相无误后再完成交易</Text>
            </View>
            <View className={styles.tipItem}>
              <Text className={styles.tipDot}>•</Text>
              <Text>交易请走平台流程，保障双方权益</Text>
            </View>
          </View>

          <View className={styles.bottomBar}>
            <View className={styles.priceInfo}>
              <Text className={styles.priceLabel}>预订价</Text>
              <Text className={styles.finalPrice}>
                <Text className={styles.yuan}>¥</Text>{book.price}
              </Text>
            </View>
            <Button
              className={classnames(styles.submitBtn, !canSubmit && styles.submitBtnDisabled)}
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              确认预约
            </Button>
          </View>
        </>
      ) : (
        <View className={styles.resultSection}>
          <View className={styles.resultSuccess}>
            <Text className={styles.resultIcon}>✓</Text>
            <Text className={styles.resultTitle}>预约成功</Text>
            <Text className={styles.resultDesc}>
              请按时前往取书，有问题请联系卖家
            </Text>
          </View>

          <View className={styles.infoCard}>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>订单号</Text>
              <Text className={styles.infoValue}>{orderId}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>取书时间</Text>
              <Text className={styles.infoValue}>{appointmentDateTime}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>取书地点</Text>
              <Text className={styles.infoValue}>{selectedLocation}</Text>
            </View>
            {memo && (
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>备注</Text>
                <Text className={styles.infoValue}>{memo}</Text>
              </View>
            )}
          </View>

          <View className={styles.actionRow}>
            <Button className={classnames(styles.actionBtn, styles.btnOutline)} onClick={handleReset}>
              重新预约
            </Button>
            <Button className={classnames(styles.actionBtn, styles.btnPrimary)} onClick={handleViewOrder}>
              查看订单
            </Button>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default AppointmentPage;
