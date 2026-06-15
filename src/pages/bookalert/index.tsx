import React, { useState } from 'react';
import { View, Text, Input, Textarea, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

const BookAlertPage: React.FC = () => {
  const [bookName, setBookName] = useState('');
  const [isbn, setIsbn] = useState('');
  const [course, setCourse] = useState('');
  const [remark, setRemark] = useState('');

  const handleSubmit = () => {
    if (!bookName && !isbn && !course) {
      Taro.showToast({ title: '请至少填写一项信息', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '设置成功',
      content: '一旦有符合条件的教材上架，我们会第一时间通知你~',
      showCancel: false,
      confirmColor: '#2b7fff',
      success: () => Taro.navigateBack()
    });
  };

  return (
    <View className={styles.wrapper}>
      <Text className={styles.icon}>🔔</Text>
      <Text className={styles.title}>缺书提醒</Text>
      <Text className={styles.desc}>
        找不到想要的教材？{'\n'}
        设置提醒后，一旦有匹配的新书上架{'\n'}
        我们会第一时间通知你！
      </Text>

      <View className={styles.formCard}>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>📖 教材名称</Text>
          <Input
            className={styles.formInput}
            placeholder="例如：高等数学（第七版）"
            value={bookName}
            onInput={(e: any) => setBookName(e.detail.value)}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>🔢 ISBN编号（选填）</Text>
          <Input
            className={styles.formInput}
            placeholder="13位ISBN，可精准匹配版本"
            value={isbn}
            onInput={(e: any) => setIsbn(e.detail.value)}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>📚 所属课程（选填）</Text>
          <Input
            className={styles.formInput}
            placeholder="例如：MATH101 高等数学"
            value={course}
            onInput={(e: any) => setCourse(e.detail.value)}
          />
        </View>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>💬 其他要求（选填）</Text>
          <Textarea
            className={styles.formTextarea}
            placeholder="例如：需要九成新以上，带笔记，价格不超过20元..."
            value={remark}
            onInput={(e: any) => setRemark(e.detail.value)}
          />
        </View>
        <Button className={styles.btn} onClick={handleSubmit}>
          ✓ 设置缺书提醒
        </Button>
      </View>
    </View>
  );
};

export default BookAlertPage;
