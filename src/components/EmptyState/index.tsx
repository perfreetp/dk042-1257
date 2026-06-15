import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface EmptyStateProps {
  icon?: string;
  title?: string;
  desc?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📚',
  title = '暂无数据',
  desc = '换个关键词搜索试试吧~'
}) => {
  return (
    <View className={styles.wrapper}>
      <Text className={styles.icon}>{icon}</Text>
      <Text className={styles.title}>{title}</Text>
      <Text className={styles.desc}>{desc}</Text>
    </View>
  );
};

export default EmptyState;
