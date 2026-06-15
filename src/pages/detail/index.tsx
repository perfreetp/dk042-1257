import React, { useState, useMemo } from 'react';
import { View, Text, Image, Swiper, SwiperItem, Button, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useShareAppMessage } from '@tarojs/taro';
import classnames from 'classnames';
import type { Book } from '@/types';
import { getBookById, mockBooks, mockPriceHistory } from '@/data/books';
import Tag from '@/components/Tag';
import PriceTrendChart from '@/components/PriceTrendChart';
import EmptyState from '@/components/EmptyState';
import styles from './index.module.scss';

const DetailPage: React.FC = () => {
  const router = useRouter();
  const bookId = router.params.id || 'b001';
  const book: Book | undefined = useMemo(() => getBookById(bookId), [bookId]);

  const [currentImg, setCurrentImg] = useState(0);
  const [isFav, setIsFav] = useState(false);

  useShareAppMessage(() => ({
    title: `${book?.title} - 书易换二手教材`,
    path: `/pages/detail/index?id=${bookId}`
  }));

  if (!book) {
    return (
      <View className={styles.page}>
        <EmptyState icon="📖" title="教材不存在" desc="该教材可能已下架，请返回首页重新搜索" />
      </View>
    );
  }

  const discount = Math.round((1 - book.price / book.originalPrice) * 100);
  const recommendedBooks = book.recommendedList
    ?.map(id => getBookById(id))
    .filter(Boolean) as Book[];

  const handleAction = (action: string) => {
    console.log('[Detail] action:', action);
    switch (action) {
      case 'favorite':
        setIsFav(f => !f);
        Taro.showToast({
          title: isFav ? '已取消收藏' : '收藏成功',
          icon: 'success'
        });
        break;
      case 'alert':
        Taro.showToast({ title: '已加入缺书提醒', icon: 'success' });
        break;
      case 'share':
        Taro.showShareMenu({ withShareTicket: true });
        Taro.showToast({ title: '点击右上角分享', icon: 'none' });
        break;
      case 'bargain':
        if (!book.canBargain) {
          Taro.showToast({ title: '该教材不支持砍价', icon: 'none' });
          return;
        }
        Taro.navigateTo({ url: `/pages/bargain/index?id=${book.id}` });
        break;
      case 'book':
        Taro.navigateTo({ url: `/pages/appointment/index?id=${book.id}` });
        break;
      case 'reserve':
        Taro.showModal({
          title: '确认预订',
          content: `预订《${book.title}》，价格¥${book.price}。请在预约时间内完成线下取书。`,
          confirmText: '确认预订',
          confirmColor: '#2b7fff',
          success: (res) => {
            if (res.confirm) {
              Taro.navigateTo({ url: `/pages/appointment/index?id=${book.id}` });
            }
          }
        });
        break;
      case 'seller':
        Taro.showModal({
          title: `联系 ${book.seller.name}`,
          content: `对方信用分 ${book.seller.creditScore}，累计交易 ${book.seller.tradeCount} 次。建议通过平台预约线下验书。`,
          confirmText: '发起预约',
          cancelText: '复制手机号',
          success: (res) => {
            if (res.confirm) {
              Taro.navigateTo({ url: `/pages/appointment/index?id=${book.id}` });
            } else if (res.cancel) {
              Taro.showToast({ title: '手机号已复制', icon: 'success' });
            }
          }
        });
        break;
    }
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <Swiper
        className={styles.swiper}
        current={currentImg}
        onChange={(e: any) => setCurrentImg(e.detail.current)}
        indicatorDots={false}
        circular
        autoplay={false}
      >
        {book.images.map((img, idx) => (
          <SwiperItem key={idx} className={styles.swiperItem}>
            <Image className={styles.swiperImg} src={img.url} mode="aspectFill" />
            <View className={styles.swiperDot}>
              <Text>{currentImg + 1}/{book.images.length}</Text>
            </View>
            <View className={styles.swiperDesc}>
              <Text>{img.desc}</Text>
            </View>
          </SwiperItem>
        ))}
      </Swiper>

      <View className={styles.contentCard}>
        <View className={styles.priceRow}>
          <View className={styles.priceWrap}>
            <Text className={styles.price}>
              <Text className={styles.yuan}>¥</Text>{book.price}
            </Text>
            <Text className={styles.originalPrice}>¥{book.originalPrice}</Text>
            <View className={styles.discount}>
              <Text>{discount}%OFF</Text>
            </View>
          </View>
          <View className={styles.viewInfo}>
            <Text>👁️ {book.viewCount}</Text>
            <Text>⭐ {book.favoriteCount}</Text>
          </View>
        </View>

        <Text className={styles.title}>{book.title}</Text>

        <View className={styles.tagRow}>
          <Tag text={book.condition} type="success" />
          {book.hasNotes && <Tag text="带笔记" type="teal" />}
          {book.canBargain && <Tag text="可砍价" type="gold" />}
          {book.versionMatch && <Tag text="版本匹配" type="primary" />}
          <Tag text={`ISBN: ${book.isbn.slice(-6)}`} type="gray" />
        </View>

        <View className={styles.infoGrid}>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>作者</Text>
            <Text className={styles.infoValue}>{book.author}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>出版社</Text>
            <Text className={styles.infoValue}>{book.publisher}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>版本</Text>
            <Text className={styles.infoValue}>{book.edition}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>ISBN</Text>
            <Text className={styles.infoValue}>{book.isbn}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>所属课程</Text>
            <Text className={styles.infoValue}>{book.course}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoLabel}>所属学院</Text>
            <Text className={styles.infoValue}>{book.college}</Text>
          </View>
        </View>

        <View className={classnames(styles.noticeBox, !book.versionMatch && styles.noticeMismatch)}>
          <Text className={styles.noticeTitle}>
            {book.versionMatch ? '✅ 版本匹配' : '⚠️ 版本差异提醒'}
          </Text>
          <Text className={styles.noticeDesc}>
            {book.versionMatch
              ? `该版本为${book.college}《${book.course}》课程推荐使用版本，与教学大纲完全匹配。`
              : '该版本与课程推荐版本存在差异，请确认内容是否适用，建议线下验书时核对。'
            }
          </Text>
        </View>
      </View>

      <View className={styles.sectionCard}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>📝 笔记情况</Text>
        </View>
        <Text className={styles.descText}>{book.notesDesc}</Text>
      </View>

      <View className={styles.sectionCard}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>💬 教材描述</Text>
        </View>
        <Text className={styles.descText}>{book.description}</Text>
      </View>

      <View className={styles.sectionCard}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>📈 价格走势</Text>
          <Text
            style={{ fontSize: 24, color: '$color-primary' }}
            onClick={() => Taro.navigateTo({ url: '/pages/pricechart/index' })}
          >
            查看详情 ›
          </Text>
        </View>
        <PriceTrendChart data={mockPriceHistory} title={`《${book.course}》同教材近6月行情`} />
      </View>

      <View className={styles.sectionCard}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>📍 可取地点</Text>
        </View>
        <View className={styles.locationList}>
          {book.pickupLocations.map((loc, i) => (
            <View key={i} className={styles.locationItem}>
              <Text className={styles.locationIcon}>📍</Text>
              <Text className={styles.locationText}>{loc}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.sectionCard}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>👤 卖家信息</Text>
        </View>
        <View className={styles.sellerCard} onClick={() => handleAction('seller')}>
          <Image className={styles.sellerAvatar} src={book.seller.avatar} mode="aspectFill" />
          <View className={styles.sellerInfo}>
            <Text className={styles.sellerName}>{book.seller.name}</Text>
            <View className={styles.sellerMeta}>
              <Text>🏛️ {book.seller.college}</Text>
              <View className={styles.sellerBadge}>累计交易{book.seller.tradeCount}次</View>
              {book.seller.noShowCount > 0 ? (
                <Text style={{ color: '$color-warning' }}>⚠️ 爽约{book.seller.noShowCount}次</Text>
              ) : (
                <Text style={{ color: '$color-success' }}>✅ 零爽约</Text>
              )}
            </View>
          </View>
          <View className={styles.creditBar}>
            <Text className={styles.creditNum}>{book.seller.creditScore}</Text>
            <Text className={styles.creditLabel}>信用分</Text>
          </View>
        </View>
      </View>

      {recommendedBooks && recommendedBooks.length > 0 && (
        <View className={styles.sectionCard}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>📚 同课推荐</Text>
          </View>
          <ScrollView className={styles.recommendList} scrollX>
            {recommendedBooks.map(b => (
              <View
                key={b.id}
                className={styles.recommendItem}
                onClick={() => Taro.redirectTo({ url: `/pages/detail/index?id=${b.id}` })}
              >
                <View className={styles.recommendCover}>
                  <Image style={{ width: '100%', height: '100%' }} src={b.cover} mode="aspectFill" />
                </View>
                <Text className={styles.recommendTitle}>{b.title}</Text>
                <Text className={styles.recommendMeta}>{b.condition} · ★{b.seller.creditScore}</Text>
                <Text className={styles.recommendPrice}>
                  <Text className={styles.yuan}>¥</Text>{b.price}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View className={styles.bottomBar}>
        <View className={styles.actionBtns}>
          <Button
            className={classnames(styles.actionBtn, isFav && styles.actionBtnActive)}
            onClick={() => handleAction('favorite')}
          >
            <Text className={styles.actionIcon}>{isFav ? '⭐' : '☆'}</Text>
            <Text className={styles.actionText}>收藏</Text>
          </Button>
          <Button className={styles.actionBtn} onClick={() => handleAction('alert')}>
            <Text className={styles.actionIcon}>🔔</Text>
            <Text className={styles.actionText}>提醒</Text>
          </Button>
          <Button className={styles.actionBtn} onClick={() => handleAction('share')}>
            <Text className={styles.actionIcon}>↗️</Text>
            <Text className={styles.actionText}>分享</Text>
          </Button>
        </View>

        <View className={styles.mainBtns}>
          <Button
            className={classnames(styles.btn, styles.btnSecondary)}
            onClick={() => handleAction('bargain')}
          >
            💰 砍价
          </Button>
          <Button
            className={classnames(styles.btn, styles.btnSecondary)}
            onClick={() => handleAction('book')}
          >
            📅 预约验书
          </Button>
          <Button
            className={classnames(styles.btn, styles.btnPrimary, styles.btnLarge)}
            onClick={() => handleAction('reserve')}
          >
            ✓ 立即预订
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

export default DetailPage;
