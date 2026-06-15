import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

const AppointmentPage: React.FC = () => {
  return (
    <View className={styles.wrapper}>
      <Text className={styles.icon}>📅</Text>
      <Text className={styles.title}>预约验书功能</Text>
      <Text className={styles.desc}>
        预约验书功能正在开发中！{'\n'}
        上线后你可以选择方便的时间地点，{'\n'}
        与卖家约定线下验书交易~
      </Text>

      <View className={styles.features}>
        <View className={styles.featureItem}>
          <Text className={styles.featureIcon}>🕒</Text>
          <Text className={styles.featureText}>灵活选择取书时间段</Text>
        </View>
        <View className={styles.featureItem}>
          <Text className={styles.featureIcon}>📍</Text>
          <Text className={styles.featureText}>多地点可选校园交接</Text>
        </View>
        <View className={styles.featureItem}>
          <Text className={styles.featureIcon}>⏰</Text>
          <Text className={styles.featureText}>到点自动提醒不错过</Text>
        </View>
        <View className={styles.featureItem}>
          <Text className={styles.featureIcon}>✅</Text>
          <Text className={styles.featureText}>确认取书完成交易</Text>
        </View>
      </View>
    </View>
  );
};

export default AppointmentPage;
