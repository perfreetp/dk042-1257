import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import type { Book } from '@/types';
import Tag from '../Tag';
import styles from './index.module.scss';

interface BookCardProps {
  book: Book;
  className?: string;
  onClick?: () => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, className, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({
        url: `/pages/detail/index?id=${book.id}`
      });
    }
  };

  const conditionType = (() => {
    switch (book.condition) {
      case '九成新': return 'success';
      case '八成新': return 'primary';
      case '七成新': return 'warning';
      default: return 'gray';
    }
  })();

  return (
    <View className={classnames(styles.card, className)} onClick={handleClick}>
      <View className={styles.coverWrap}>
        <Image className={styles.cover} src={book.cover} mode="aspectFill" />
        <View className={styles.conditionBadge}>{book.condition}</View>
      </View>

      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.title}>{book.title}</Text>
          <View className={styles.metaRow}>
            <Text className={styles.metaText}>{book.author} · {book.publisher}</Text>
          </View>
          <View className={styles.metaRow}>
            <Text className={styles.metaText}>{book.course} | {book.college}</Text>
          </View>
          <View className={styles.tagsRow}>
            {book.hasNotes && <Tag text="有笔记" type="teal" />}
            {book.canBargain && <Tag text="可砍价" type="gold" />}
            {book.versionMatch && <Tag text="版本匹配" type="success" />}
          </View>
        </View>

        <View className={styles.footer}>
          <View className={styles.priceWrap}>
            <Text className={styles.price}>
              <Text className={styles.yuan}>¥</Text>{book.price}
            </Text>
            <Text className={styles.originalPrice}>原价¥{book.originalPrice}</Text>
            {book.priceMin && book.priceMax && (
              <Text className={styles.priceRange}>同课¥{book.priceMin}-{book.priceMax}</Text>
            )}
          </View>
          <View className={styles.infoRight}>
            <View className={styles.location}>
              <Text className={styles.dot}>📍</Text>
              <Text>{book.pickupLocations[0]}</Text>
            </View>
            <View className={styles.seller}>
              <Text>{book.seller.name}</Text>
              <Text className={styles.credit}>★{book.seller.creditScore}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default BookCard;
