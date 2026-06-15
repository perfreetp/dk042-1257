import React, { useState, useEffect } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

export type SearchType = 'all' | 'title' | 'isbn' | 'course' | 'college';

interface SearchBarProps {
  value?: string;
  type?: SearchType;
  placeholder?: string;
  onChange?: (keyword: string) => void;
  onTypeChange?: (type: SearchType) => void;
  onSearch?: (keyword: string, type: SearchType) => void;
}

const TYPE_OPTIONS: { key: SearchType; label: string }[] = [
  { key: 'all', label: '综合' },
  { key: 'title', label: '书名' },
  { key: 'isbn', label: 'ISBN' },
  { key: 'course', label: '课程' },
  { key: 'college', label: '学院' }
];

const SearchBar: React.FC<SearchBarProps> = ({
  value = '',
  type = 'all',
  placeholder = '搜索书名/ISBN/课程/学院',
  onChange,
  onTypeChange,
  onSearch
}) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInput = (e: any) => {
    const v = e.detail.value;
    setInputValue(v);
    onChange?.(v);
  };

  const handleConfirm = (e: any) => {
    onSearch?.(e.detail.value, type);
  };

  const handleClear = () => {
    setInputValue('');
    onChange?.('');
    onSearch?.('', type);
  };

  const handleTypeClick = (t: SearchType) => {
    onTypeChange?.(t);
    onSearch?.(inputValue, t);
  };

  return (
    <View className={styles.wrapper}>
      <View className={styles.searchBar}>
        <Text className={styles.icon}>🔍</Text>
        <Input
          className={styles.input}
          value={inputValue}
          placeholder={placeholder}
          placeholderClass={styles.placeholder}
          confirmType="search"
          onInput={handleInput}
          onConfirm={handleConfirm}
        />
        {inputValue && (
          <Text className={styles.clearBtn} onClick={handleClear}>✕</Text>
        )}
      </View>

      <ScrollView className={styles.typeTabs} scrollX>
        {TYPE_OPTIONS.map(opt => (
          <View
            key={opt.key}
            className={classnames(styles.typeTab, type === opt.key && styles.active)}
            onClick={() => handleTypeClick(opt.key)}
          >
            <Text>{opt.label}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

export default SearchBar;
