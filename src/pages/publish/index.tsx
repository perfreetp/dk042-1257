import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

const PublishPage: React.FC = () => {
  return (
    <View className={styles.wrapper}>
      <Text className={styles.icon}>📝</Text>
      <Text className={styles.title}>发布教材功能</Text>
      <Text className={styles.desc}>
        功能正在开发中，敬请期待！{'\n'}
        上线后你可以快速上传闲置教材，{'\n'}
        填写信息后即可发布给同校同学~
      </Text>

      <View className={styles.features}>
        <View className={styles.featureItem}>
          <Text className={styles.featureIcon}>📷</Text>
          <Text className={styles.featureText}>一键上传实拍图</Text>
        </View>
        <View className={styles.featureItem}>
          <Text className={styles.featureIcon}>✏️</Text>
          <Text className={styles.featureText}>标注笔记情况与新旧</Text>
        </View>
        <View className={styles.featureItem}>
          <Text className={styles.featureIcon}>📍</Text>
          <Text className={styles.featureText}>设置可取地点与时间</Text>
        </View>
        <View className={styles.featureItem}>
          <Text className={styles.featureIcon}>💰</Text>
          <Text className={styles.featureText}>智能估价参考定价</Text>
        </View>
      </View>
    </View>
  );
};

export default PublishPage;
