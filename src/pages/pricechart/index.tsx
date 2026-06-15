import React, { useState, useMemo } from 'react';
import { View, Text, Input, Button, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import PriceTrendChart from '@/components/PriceTrendChart';
import { searchBooks, mockPriceHistory } from '@/data/books';
import { getBookById, mockBooks } from '@/data/books';
import type { Book, PricePoint } from '@/types';
import { useAppStore } from '@/store/app';
import EmptyState from '@/components/EmptyState';
import styles from './index.module.scss';

const hotBooksData = [
  { rank: 1, bookId: 'b005', name: '高等数学（同济七版）', sub: '数学学院 · MATH101', price: 18, trend: -15 },
  { rank: 2, bookId: 'b006', name: '线性代数（同济六版）', sub: '数学学院 · MATH102', price: 15, trend: -8 },
  { rank: 3, bookId: 'b012', name: '大学英语（新视野三版）', sub: '外国语学院 · ENG101', price: 18, trend: -5 },
  { rank: 4, bookId: 'b001', name: '数据结构（C语言版）', sub: '计算机学院 · CS101', price: 18, trend: 3 },
  { rank: 5, bookId: 'b009', name: '大学物理（马文蔚）', sub: '物理学院 · PHY101', price: 16, trend: -12 },
  { rank: 6, bookId: 'b008', name: '微观经济学（高鸿业）', sub: '经管学院 · ECO101', price: 18, trend: 0 }
];

const PriceChartPage: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [searchedBook, setSearchedBook] = useState<Book | null>(null);
  const [searchedHistory, setSearchedHistory] = useState<PricePoint[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { getPriceHistory } = useAppStore();

  const handleSearch = () => {
    if (!keyword.trim()) {
      Taro.showToast({ title: '请输入书名或课程', icon: 'none' });
      return;
    }
    setHasSearched(true);
    const results = searchBooks(keyword, 'all');
    if (results.length > 0) {
      const book = results[0];
      setSearchedBook(book);
      setSearchedHistory(getPriceHistory(book.id));
    } else {
      setSearchedBook(null);
      setSearchedHistory([]);
    }
  };

  const handleHotBookClick = (bookId: string) => {
    const book = getBookById(bookId);
    if (book) {
      setKeyword(book.title);
      setHasSearched(true);
      setSearchedBook(book);
      setSearchedHistory(getPriceHistory(bookId));
    }
  };

  const handleBookDetail = () => {
    if (searchedBook) {
      Taro.navigateTo({ url: `/pages/detail/index?id=${searchedBook.id}` });
    }
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.searchRow}>
        <Input
          className={styles.searchInput}
          placeholder="输入书名/课程/ISBN查走势"
          value={keyword}
          onInput={(e: any) => setKeyword(e.detail.value)}
          confirmType="search"
          onConfirm={handleSearch}
        />
        <Button className={styles.searchBtn} onClick={handleSearch}>查询</Button>
      </View>

      {hasSearched && (
        <View className={styles.section}>
          {searchedBook ? (
            <>
              <Text className={styles.sectionTitle}>📊 《{searchedBook.title}》价格走势</Text>

              <View className={styles.bookInfoCard}>
                <Image className={styles.bookCover} src={searchedBook.cover} mode="aspectFill" />
                <View className={styles.bookInfo}>
                  <Text className={styles.bookTitle}>{searchedBook.title}</Text>
                  <Text className={styles.bookMeta}>{searchedBook.author} · {searchedBook.publisher}</Text>
                  <Text className={styles.bookCourse}>{searchedBook.course} · {searchedBook.college}</Text>
                  <View className={styles.priceRow}>
                    <Text className={styles.currentPrice}>
                      当前均价 <Text className={styles.priceNum}>¥{searchedBook.price}</Text>
                    </Text>
                  </View>
                </View>
              </View>

              <PriceTrendChart
                data={searchedHistory}
                title={`《${searchedBook.course}》近6月价格走势`}
              />

              <View className={styles.priceStats}>
                <View className={styles.statItem}>
                  <Text className={styles.statLabel}>最低价</Text>
                  <Text className={classnames(styles.statValue, styles.priceLow)}>
                    ¥{Math.min(...searchedHistory.map(p => p.minPrice))}
                  </Text>
                </View>
                <View className={styles.statItem}>
                  <Text className={styles.statLabel}>最高价</Text>
                  <Text className={classnames(styles.statValue, styles.priceHigh)}>
                    ¥{Math.max(...searchedHistory.map(p => p.maxPrice))}
                  </Text>
                </View>
                <View className={styles.statItem}>
                  <Text className={styles.statLabel}>在售数量</Text>
                  <Text className={styles.statValue}>
                    {searchedHistory[searchedHistory.length - 1]?.count || 0}本
                  </Text>
                </View>
              </View>

              <Button className={styles.viewDetailBtn} onClick={handleBookDetail}>
                查看在售教材 →
              </Button>
            </>
          ) : (
            <EmptyState
              icon="🔍"
              title="未找到相关教材"
              desc="换个关键词试试，或者设置缺书提醒，有书了第一时间通知你"
            />
          )}
        </View>
      )}

      {!hasSearched && (
        <>
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>📊 热门教材总体走势</Text>
            <PriceTrendChart data={mockPriceHistory} title="全校二手教材近6月均价" />
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>🔥 热门教材行情榜</Text>
            <View className={styles.hotList}>
              {hotBooksData.map(b => {
                const book = getBookById(b.bookId);
                const history = getPriceHistory(b.bookId);
                const avgPrice = history.length > 0 ? history[history.length - 1].avgPrice : b.price;
                return (
                  <View
                    key={b.rank}
                    className={styles.hotItem}
                    onClick={() => handleHotBookClick(b.bookId)}
                  >
                    <View className={[
                      styles.hotRank,
                      b.rank === 1 ? styles.rank1 : b.rank === 2 ? styles.rank2 : b.rank === 3 ? styles.rank3 : styles.rankOther
                    ].join(' ')}>
                      <Text>{b.rank}</Text>
                    </View>
                    <View className={styles.hotInfo}>
                      <Text className={styles.hotName}>{b.name}</Text>
                      <Text className={styles.hotSub}>{b.sub} · 均价¥{avgPrice}</Text>
                    </View>
                    <View className={styles.hotRight}>
                      <Text className={[
                        styles.hotTrend,
                        b.trend < 0 ? styles.trendDown : b.trend > 0 ? styles.trendUp : ''
                      ].join(' ')}>
                        {b.trend < 0 ? '↓' : b.trend > 0 ? '↑' : '→'}{Math.abs(b.trend)}%
                      </Text>
                      <Text className={styles.viewText}>查看</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          <View className={styles.section}>
            <Text className={styles.sectionTitle}>💡 购书建议</Text>
            <View className={styles.tipsCard}>
              <View className={styles.tipItem}>
                <Text className={styles.tipIcon}>📅</Text>
                <View className={styles.tipContent}>
                  <Text className={styles.tipTitle}>最佳购书时间</Text>
                  <Text className={styles.tipDesc}>6-7月是毕业生卖书高峰期，教材数量多、价格低</Text>
                </View>
              </View>
              <View className={styles.tipItem}>
                <Text className={styles.tipIcon}>💰</Text>
                <View className={styles.tipContent}>
                  <Text className={styles.tipTitle}>价格规律</Text>
                  <Text className={styles.tipDesc}>开学前2周价格上涨明显，建议提前1个月购买</Text>
                </View>
              </View>
              <View className={styles.tipItem}>
                <Text className={styles.tipIcon}>🔔</Text>
                <View className={styles.tipContent}>
                  <Text className={styles.tipTitle}>缺书提醒</Text>
                  <Text className={styles.tipDesc}>找不到心仪教材？设置缺书提醒，有货第一时间通知</Text>
                </View>
              </View>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default PriceChartPage;
