import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro';
import SearchBar, { SearchType } from '@/components/SearchBar';
import FilterTabs, { FilterState, SortKey } from '@/components/FilterTabs';
import BookCard from '@/components/BookCard';
import EmptyState from '@/components/EmptyState';
import Tag from '@/components/Tag';
import { mockBooks, searchBooks } from '@/data/books';
import { mockColleges } from '@/data/colleges';
import type { Book, BookCondition } from '@/types';
import styles from './index.module.scss';

const HomePage: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [filter, setFilter] = useState<FilterState>({
    conditions: [],
    hasNotes: null,
    canBargain: null,
    sortBy: 'default'
  });
  const [displayCount, setDisplayCount] = useState(10);
  const [refreshing, setRefreshing] = useState(false);

  usePullDownRefresh(() => {
    setRefreshing(true);
    setTimeout(() => {
      setDisplayCount(10);
      setRefreshing(false);
      Taro.stopPullDownRefresh();
    }, 800);
  });

  useReachBottom(() => {
    if (displayCount < filteredBooks.length) {
      setDisplayCount(c => c + 5);
    }
  });

  const filteredBooks = useMemo(() => {
    let list: Book[] = searchBooks(keyword, searchType);

    if (filter.conditions.length > 0) {
      list = list.filter(b => filter.conditions.includes(b.condition as BookCondition));
    }
    if (filter.hasNotes !== null) {
      list = list.filter(b => b.hasNotes === filter.hasNotes);
    }
    if (filter.canBargain !== null) {
      list = list.filter(b => b.canBargain === filter.canBargain);
    }

    const sortFn: Record<SortKey, (a: Book, b: Book) => number> = {
      default: () => 0,
      price: (a, b) => a.price - b.price,
      priceDesc: (a, b) => b.price - a.price,
      time: (a, b) => new Date(b.publishTime).getTime() - new Date(a.publishTime).getTime(),
      credit: (a, b) => b.seller.creditScore - a.seller.creditScore
    };
    if (filter.sortBy !== 'default') {
      list = [...list].sort(sortFn[filter.sortBy]);
    }

    return list;
  }, [keyword, searchType, filter]);

  const displayBooks = filteredBooks.slice(0, displayCount);

  const handleEntry = (type: string, payload?: string) => {
    console.log('[Home] entry click:', type, payload);
    if (type === 'college' && payload) {
      setKeyword(payload);
      setSearchType('college');
    } else if (type === 'alert') {
      Taro.navigateTo({ url: '/pages/bookalert/index' });
    } else if (type === 'trend') {
      Taro.navigateTo({ url: '/pages/pricechart/index' });
    } else if (type === 'publish') {
      Taro.switchTab({ url: '/pages/publish/index' });
    }
  };

  return (
    <ScrollView className={styles.page} scrollY scrollWithAnimation>
      <View className={styles.hero}>
        <Text className={styles.heroTitle}>📚 书易换</Text>
        <Text className={styles.heroSubtitle}>开学找书不用愁，同校教材一站搜</Text>

        <View className={styles.quickEntries}>
          <View className={styles.entryItem} onClick={() => handleEntry('alert')}>
            <View className={styles.entryIcon}>🔔</View>
            <Text className={styles.entryText}>缺书提醒</Text>
          </View>
          <View className={styles.entryItem} onClick={() => handleEntry('trend')}>
            <View className={styles.entryIcon}>📈</View>
            <Text className={styles.entryText}>价格走势</Text>
          </View>
          <View className={styles.entryItem} onClick={() => handleEntry('publish')}>
            <View className={styles.entryIcon}>📤</View>
            <Text className={styles.entryText}>我要卖书</Text>
          </View>
          <View className={styles.entryItem} onClick={() => Taro.switchTab({ url: '/pages/orders/index' })}>
            <View className={styles.entryIcon}>📋</View>
            <Text className={styles.entryText}>我的订单</Text>
          </View>
        </View>
      </View>

      <SearchBar
        value={keyword}
        type={searchType}
        onSearch={(kw, t) => {
          setKeyword(kw);
          setSearchType(t);
          setDisplayCount(10);
        }}
        onTypeChange={setSearchType}
        onChange={setKeyword}
      />

      <View className={styles.sectionHeader}>
        <Text className={styles.sectionTitle}>
          🔥 热门学院
          <Text className={styles.sectionBadge}>{mockColleges.length}个</Text>
        </Text>
      </View>
      <ScrollView className={styles.hotScroll} scrollX>
        {mockColleges.map(college => (
          <View
            key={college.id}
            className={styles.hotCard}
            onClick={() => handleEntry('college', college.name)}
          >
            <Text className={styles.hotIcon}>{college.icon}</Text>
            <Text className={styles.hotName}>{college.name}</Text>
            <Text className={styles.hotCount}>
              {college.courses.reduce((s, c) => s + c.bookCount, 0)}本在售
            </Text>
          </View>
        ))}
      </ScrollView>

      <FilterTabs value={filter} onChange={setFilter} />

      <View className={styles.listArea}>
        <View className={styles.resultInfo}>
          <Text>共找到 <Text style={{ color: '$color-primary', fontWeight: 600 }}>{filteredBooks.length}</Text> 本教材</Text>
          {keyword && <Tag text={`关键词：${keyword}`} type="primary" />}
        </View>

        {displayBooks.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="没有找到相关教材"
            desc="试试调整搜索关键词，或者设置缺书提醒，有书了第一时间通知你~"
          />
        ) : (
          <>
            {displayBooks.map(book => (
              <BookCard key={book.id} book={book} />
            ))}
            {displayCount < filteredBooks.length && (
              <View className={styles.loadMore}>
                <Text>加载更多...</Text>
              </View>
            )}
            {displayCount >= filteredBooks.length && filteredBooks.length > 0 && (
              <View className={styles.loadMore}>
                <Text>— 已显示全部 {filteredBooks.length} 本 —</Text>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default HomePage;
