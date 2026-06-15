import React, { useState, useMemo } from 'react';
import { View, Text, Image, Textarea, Button, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { getBookById } from '@/data/books';
import type { Book } from '@/types';
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

const AppointmentPage: React.FC = () => {
  const router = useRouter();
  const bookId = router.params.id || 'b001';
  const book: Book | undefined = useMemo(() => getBookById(bookId), [bookId]);

  const { createOrder } = useAppStore();

  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [memo, setMemo] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [orderId, setOrderId] = useState('');

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

  const appointmentDateTime = useMemo(() => {
    if (!selectedTime || selectedDate < 0) return '';
    return `${dates[selectedDate].fullDate} ${selectedTime.split(' - ')[0]}`;
  }, [selectedDate, selectedTime, dates]);

  const canSubmit = selectedTime && selectedLocation;

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

    const newOrder = createOrder(bookId, {
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
