import React from 'react';
import { View, Text } from '@tarojs/components';
import type { PricePoint } from '@/types';
import styles from './index.module.scss';

interface PriceTrendChartProps {
  data: PricePoint[];
  title?: string;
}

const PriceTrendChart: React.FC<PriceTrendChartProps> = ({ data, title = '价格走势' }) => {
  if (!data || data.length === 0) return null;

  const maxPrice = Math.max(...data.map(d => d.maxPrice)) + 10;
  const getY = (p: number) => (p / maxPrice) * 100;

  const avgFirst = data[0].avgPrice;
  const avgLast = data[data.length - 1].avgPrice;
  const trendPercent = (((avgLast - avgFirst) / avgFirst) * 100).toFixed(1);
  const isDown = Number(trendPercent) < 0;

  return (
    <View className={styles.wrapper}>
      <View className={styles.header}>
        <Text className={styles.title}>{title}</Text>
        <Text className={styles.trend} style={{ color: isDown ? '$color-success' : '#f5222d' }}>
          {isDown ? '↓' : '↑'} {Math.abs(Number(trendPercent))}% 近6月
        </Text>
      </View>

      <View className={styles.chartArea}>
        <View className={styles.yAxis}>
          <Text className={styles.yLabel}>¥{maxPrice}</Text>
          <Text className={styles.yLabel}>¥{Math.round(maxPrice * 0.66)}</Text>
          <Text className={styles.yLabel}>¥{Math.round(maxPrice * 0.33)}</Text>
          <Text className={styles.yLabel}>¥0</Text>
        </View>

        <View className={styles.plotArea}>
          <View className={styles.bars}>
            {data.map((d, i) => (
              <View key={i} className={styles.barGroup} style={{ height: '100%' }}>
                <Text className={styles.priceLabel}>¥{d.avgPrice}</Text>
                <View
                  className={styles.avgBar}
                  style={{ height: `${getY(d.avgPrice) - getY(d.minPrice)}%` }}
                />
              </View>
            ))}
          </View>
        </View>

        <View className={styles.xAxis}>
          {data.map((d, i) => (
            <Text key={i} className={styles.xLabel}>{d.date}</Text>
          ))}
        </View>
      </View>

      <View className={styles.legend}>
        <View className={styles.legendItem}>
          <View className={styles.legendDot} style={{ backgroundColor: '#2b7fff' }} />
          <Text>均价</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={styles.legendDot} style={{ backgroundColor: 'rgba(54, 207, 201, 0.7)' }} />
          <Text>最低</Text>
        </View>
        <View className={styles.legendItem}>
          <View className={styles.legendDot} style={{ backgroundColor: 'rgba(255, 125, 0, 0.7)' }} />
          <Text>最高</Text>
        </View>
      </View>
    </View>
  );
};

export default PriceTrendChart;
