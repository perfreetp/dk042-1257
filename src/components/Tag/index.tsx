import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

export type TagType = 'primary' | 'success' | 'warning' | 'error' | 'gold' | 'teal' | 'gray';

interface TagProps {
  text: string;
  type?: TagType;
  className?: string;
}

const Tag: React.FC<TagProps> = ({ text, type = 'primary', className }) => {
  return (
    <View className={classnames(styles.tag, styles[type], className)}>
      <Text>{text}</Text>
    </View>
  );
};

export default Tag;
