import React, { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import PriceTrendChart from '@/components/PriceTrendChart';
import { mockPriceHistory } from '@/data/books';
import styles from './index.module.scss';

const hotBooks = [
  { rank: 1, name: '高等数学（同济七版）', sub: '数学学院 · MATH101', price: 18, trend: -15 },
  { rank: 2, name: '线性代数（同济六版）', sub: '数学学院 · MATH102', price: 15, trend: -8 },
  { rank: 3, name: '大学英语（新视野三版）', sub: '外国语学院 · ENG101', price: 18, trend: -5 },
  { rank: 4, name: '数据结构（C语言版）', sub: '计算机学院 · CS101', price: 18, trend: 3 },
  { rank: 5, name: '大学物理（马文蔚）', sub: '物理学院 · PHY101', price: 16, trend: -12 },
  { rank: 6, name: '微观经济学（高鸿业）', sub: '经管学院 · ECO101', price: 18, trend: 0 }
];

const PriceChartPage: React.FC = () => {
  const [keyword, setKeyword] = useState('');

  const handleSearch = () => {
    if (!keyword) {
      Taro.showToast({ title: '请输入书名或课程', icon: 'none' });
    } else {
      Taro.showToast({ title: `已查询《${keyword}》走势`, icon: 'none' });
    }
  };

  return (
    <View className={styles.page}>
      <View className={styles.searchRow}>
        <Input
          className={styles.searchInput}
          placeholder="输入书名/课程查走势"
          value={keyword}
          onInput={(e: any) => setKeyword(e.detail.value)}
          confirmType="search"
          onConfirm={handleSearch}
        />
        <Button className={styles.searchBtn} onClick={handleSearch}>查询</Button>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>📊 热门教材总体走势</Text>
        <PriceTrendChart data={mockPriceHistory} title="全校二手教材近6月均价" />
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>🔥 热门教材行情榜</Text>
        <View className={styles.hotList}>
          {hotBooks.map(b => (
            <View key={b.rank} className={styles.hotItem}>
              <View className={[
                styles.hotRank,
                b.rank === 1 ? styles.rank1 : b.rank === 2 ? styles.rank2 : b.rank === 3 ? styles.rank3 : styles.rankOther
              ].join(' ')}>
                <Text>{b.rank}</Text>
              </View>
              <View className={styles.hotInfo}>
                <Text className={styles.hotName}>{b.name}</Text>
                <Text className={styles.hotSub}>{b.sub} · 均价¥{b.price}</Text>
              </View>
              <Text className={[
                styles.hotTrend,
                b.trend < 0 ? styles.trendDown : b.trend > 0 ? styles.trendUp : ''
              ].join(' ')}>
                {b.trend < 0 ? '↓' : b.trend > 0 ? '↑' : '→'}{Math.abs(b.trend)}%
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>💡 购书建议</Text>
        <PriceTrendChart
          data={mockPriceHistory}
          title="提示：6-7月是购书黄金期，价格最低"
        />
      </View>
    </View>
  );
};

export default PriceChartPage;
