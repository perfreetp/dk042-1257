import React from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import type { BookCondition } from '@/types';
import styles from './index.module.scss';

export type SortKey = 'default' | 'price' | 'priceDesc' | 'time' | 'credit';

export interface FilterState {
  conditions: BookCondition[];
  hasNotes: boolean | null;
  canBargain: boolean | null;
  sortBy: SortKey;
}

interface FilterTabsProps {
  value: FilterState;
  onChange: (v: FilterState) => void;
}

const FilterTabs: React.FC<FilterTabsProps> = ({ value, onChange }) => {
  const toggleCondition = (c: BookCondition) => {
    const next = [...value.conditions];
    const idx = next.indexOf(c);
    if (idx > -1) next.splice(idx, 1);
    else next.push(c);
    onChange({ ...value, conditions: next });
  };

  const cycleSort = () => {
    const order: SortKey[] = ['default', 'price', 'priceDesc', 'time', 'credit'];
    const labels: Record<SortKey, string> = {
      default: '综合排序',
      price: '价格↑',
      priceDesc: '价格↓',
      time: '最新发布',
      credit: '信用最高'
    };
    const idx = order.indexOf(value.sortBy);
    const next = order[(idx + 1) % order.length];
    onChange({ ...value, sortBy: next });
  };

  const sortLabel: Record<SortKey, string> = {
    default: '综合排序',
    price: '价格升序',
    priceDesc: '价格降序',
    time: '最新发布',
    credit: '信用最高'
  };

  const conditions: BookCondition[] = ['九成新', '八成新', '七成新', '六成新及以下'];

  return (
    <View className={styles.wrapper}>
      <ScrollView className={styles.tabsRow} scrollX>
        <View
          className={classnames(styles.tab, value.sortBy !== 'default' && styles.active)}
          onClick={cycleSort}
        >
          <Text>{sortLabel[value.sortBy]}</Text>
          <Text className={styles.arrow}>▼</Text>
        </View>

        {conditions.map(c => (
          <View
            key={c}
            className={classnames(styles.tab, value.conditions.includes(c) && styles.active)}
            onClick={() => toggleCondition(c)}
          >
            <Text>{c}</Text>
          </View>
        ))}

        <View
          className={classnames(styles.tab, value.hasNotes === true && styles.active)}
          onClick={() => onChange({ ...value, hasNotes: value.hasNotes === true ? null : true })}
        >
          <Text>有笔记</Text>
        </View>

        <View
          className={classnames(styles.tab, value.canBargain === true && styles.active)}
          onClick={() => onChange({ ...value, canBargain: value.canBargain === true ? null : true })}
        >
          <Text>可砍价</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default FilterTabs;
