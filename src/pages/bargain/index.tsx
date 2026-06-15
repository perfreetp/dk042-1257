import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

const BargainPage: React.FC = () => {
  return (
    <View className={styles.wrapper}>
      <Text className={styles.icon}>💰</Text>
      <Text className={styles.title}>砍价功能</Text>
      <Text className={styles.desc}>
        砍价功能正在开发中！{'\n'}
        上线后你可以对支持砍价的教材{'\n'}
        发起价格协商，双方达成一致后再交易~
      </Text>

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
          <Text>砍价前先看教材品相，物有所值最重要</Text>
        </View>
        <View className={styles.tipItem}>
          <Text className={styles.tipDot}>•</Text>
          <Text>砍价成功后请在24小时内完成预订</Text>
        </View>
      </View>
    </View>
  );
};

export default BargainPage;
