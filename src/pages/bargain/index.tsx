import React, { useState, useMemo } from 'react';
import { View, Text, Image, Input, Textarea, Button, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { getBookById } from '@/data/books';
import type { Book } from '@/types';
import { useAppStore, type BargainRecord } from '@/store/app';
import EmptyState from '@/components/EmptyState';
import styles from './index.module.scss';

const BargainPage: React.FC = () => {
  const router = useRouter();
  const bookId = router.params.id || 'b001';
  const book: Book | undefined = useMemo(() => getBookById(bookId), [bookId]);

  const { bargainRecords, addBargain } = useAppStore();

  const [bargainPrice, setBargainPrice] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [lastRecord, setLastRecord] = useState<BargainRecord | null>(null);

  const myRecords = useMemo(() => bargainRecords, [bargainRecords]);

  const suggestedPrices = useMemo(() => {
    if (!book) return [];
    return [
      Math.round(book.price * 0.9),
      Math.round(book.price * 0.8),
      Math.round(book.price * 0.7)
    ];
  }, [book]);

  const handlePriceClick = (price: number) => {
    setBargainPrice(price.toString());
  };

  const handleSubmit = () => {
    if (!book) return;
    const price = parseFloat(bargainPrice);
    if (isNaN(price) || price <= 0) {
      Taro.showToast({ title: '请输入有效的砍价金额', icon: 'none' });
      return;
    }
    if (price >= book.price) {
      Taro.showToast({ title: '砍价需低于当前价格', icon: 'none' });
      return;
    }
    if (price < book.price * 0.5) {
      Taro.showToast({ title: '砍价过低，建议合理砍价', icon: 'none' });
      return;
    }

    const record = addBargain(bookId, price, message || '');
    setLastRecord(record);
    setSubmitted(true);
    Taro.showToast({ title: '砍价请求已发送', icon: 'success' });
  };

  const handleReset = () => {
    setSubmitted(false);
    setBargainPrice('');
    setMessage('');
  };

  const handleViewOrders = () => {
    Taro.switchTab({ url: '/pages/orders/index' });
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
          <View className={styles.priceRow}>
            <Text className={styles.currentPrice}>
              <Text className={styles.yuan}>¥</Text>{book.price}
            </Text>
            <Text className={styles.originalPrice}>原价 ¥{book.originalPrice}</Text>
          </View>
        </View>
      </View>

      {!submitted ? (
        <View className={styles.formSection}>
          <Text className={styles.sectionTitle}>💰 发起砍价</Text>

          <View className={styles.formItem}>
            <Text className={styles.label}>期望价格</Text>
            <View className={styles.priceInputWrap}>
              <Text className={styles.priceSymbol}>¥</Text>
              <Input
                className={styles.priceInput}
                type="digit"
                placeholder="请输入期望价格"
                value={bargainPrice}
                onInput={(e: any) => setBargainPrice(e.detail.value)}
              />
            </View>
            <View className={styles.suggestedPrices}>
              <Text className={styles.suggestLabel}>快捷选择：</Text>
              {suggestedPrices.map((p, i) => (
                <View
                  key={i}
                  className={classnames(
                    styles.priceTag,
                    bargainPrice === p.toString() && styles.priceTagActive
                  )}
                  onClick={() => handlePriceClick(p)}
                >
                  <Text>¥{p}</Text>
                  <Text className={styles.priceTagLabel}>
                    {i === 0 ? '9折' : i === 1 ? '8折' : '7折'}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.label}>砍价留言（选填）</Text>
            <Textarea
              className={styles.textarea}
              placeholder="可以说说你的砍价理由，比如多本一起买、自提等~"
              value={message}
              onInput={(e: any) => setMessage(e.detail.value)}
              maxlength={200}
            />
          </View>

          <View className={styles.tipBox}>
            <Text className={styles.tipTitle}>💡 砍价小贴士</Text>
            <View className={styles.tipItem}>
              <Text className={styles.tipDot}>•</Text>
              <Text>建议合理砍价，一般可在标价基础上优惠10%-30%</Text>
            </View>
            <View className={styles.tipItem}>
              <Text className={styles.tipDot}>•</Text>
              <Text>态度友善更容易砍价成功哦~</Text>
            </View>
            <View className={styles.tipItem}>
              <Text className={styles.tipDot}>•</Text>
              <Text>砍价请求将在24小时内等待卖家回复</Text>
            </View>
          </View>

          <Button className={styles.submitBtn} onClick={handleSubmit}>
            发送砍价请求
          </Button>
        </View>
      ) : (
        <View className={styles.resultSection}>
          <View className={styles.resultSuccess}>
            <Text className={styles.resultIcon}>✓</Text>
            <Text className={styles.resultTitle}>砍价请求已发送</Text>
            <Text className={styles.resultDesc}>
              等待卖家 {book.seller.name} 回复，预计24小时内有结果
            </Text>
          </View>

          {lastRecord && (
            <View className={styles.recordCard}>
              <Text className={styles.recordTitle}>砍价详情</Text>
              <View className={styles.recordRow}>
                <Text className={styles.recordLabel}>教材</Text>
                <Text className={styles.recordValue}>{lastRecord.bookTitle}</Text>
              </View>
              <View className={styles.recordRow}>
                <Text className={styles.recordLabel}>原价</Text>
                <Text className={styles.recordValue}>¥{lastRecord.originalPrice}</Text>
              </View>
              <View className={styles.recordRow}>
                <Text className={styles.recordLabel}>我的出价</Text>
                <Text className={classnames(styles.recordValue, styles.recordPrice)}>
                  ¥{lastRecord.bargainPrice}
                </Text>
              </View>
              <View className={styles.recordRow}>
                <Text className={styles.recordLabel}>留言</Text>
                <Text className={styles.recordValue}>
                  {lastRecord.message || '（未填写）'}
                </Text>
              </View>
              <View className={styles.recordRow}>
                <Text className={styles.recordLabel}>状态</Text>
                <View className={styles.statusTag}>
                  <Text>⏳ 待卖家回复</Text>
                </View>
              </View>
            </View>
          )}

          <View className={styles.actionRow}>
            <Button className={classnames(styles.actionBtn, styles.btnOutline)} onClick={handleReset}>
              重新砍价
            </Button>
            <Button className={classnames(styles.actionBtn, styles.btnPrimary)} onClick={handleViewOrders}>
              查看订单
            </Button>
          </View>
        </View>
      )}

      {myRecords.length > 0 && (
        <View className={styles.historySection}>
          <Text className={styles.sectionTitle}>📋 我的砍价记录</Text>
          {myRecords.map(record => (
            <View key={record.id} className={styles.historyItem}>
              <Image className={styles.historyCover} src={record.bookCover} mode="aspectFill" />
              <View className={styles.historyInfo}>
                <Text className={styles.historyTitle}>{record.bookTitle}</Text>
                <Text className={styles.historyMeta}>
                  卖家：{record.sellerName} · {record.createTime}
                </Text>
                <View className={styles.historyPriceRow}>
                  <Text className={styles.historyPrice}>
                    出价¥{record.bargainPrice} <Text className={styles.historySlash}>/</Text> 原价¥{record.originalPrice}
                  </Text>
                  <View className={classnames(
                    styles.historyStatus,
                    record.status === 'pending' && styles.statusPending,
                    record.status === 'accepted' && styles.statusAccepted,
                    record.status === 'rejected' && styles.statusRejected
                  )}>
                    <Text>
                      {record.status === 'pending' ? '待回复' :
                       record.status === 'accepted' ? '已接受' : '已拒绝'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default BargainPage;
