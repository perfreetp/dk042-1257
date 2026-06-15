import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { mockColleges } from '@/data/colleges';
import { getBooksByCourse, getBooksByCollege } from '@/data/books';
import styles from './index.module.scss';

const CategoryPage: React.FC = () => {
  const [activeCollegeId, setActiveCollegeId] = useState(mockColleges[0].id);

  const activeCollege = useMemo(
    () => mockColleges.find(c => c.id === activeCollegeId) || mockColleges[0],
    [activeCollegeId]
  );

  const hotCourses = useMemo(() => {
    const all = mockColleges.flatMap(c => c.courses.map(course => ({ ...course, collegeName: c.name })));
    return all.sort((a, b) => b.bookCount - a.bookCount).slice(0, 4);
  }, []);

  const handleCourseClick = (courseCode: string, courseName: string) => {
    console.log('[Category] course click:', courseCode, courseName);
    const books = getBooksByCourse(courseCode);
    if (books.length === 0) {
      Taro.showToast({ title: '暂无该课程教材', icon: 'none' });
      return;
    }
    Taro.navigateTo({
      url: `/pages/detail/index?id=${books[0].id}`
    });
  };

  const handleHotCourseClick = (course: any) => {
    console.log('[Category] hot course click:', course);
    const books = getBooksByCourse(course.id);
    if (books.length === 0) {
      Taro.showToast({ title: '暂无该课程教材', icon: 'none' });
      return;
    }
    Taro.navigateTo({
      url: `/pages/detail/index?id=${books[0].id}`
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>📂 分类浏览</Text>
        <Text className={styles.headerDesc}>按学院课程查找，精准定位所需教材</Text>
      </View>

      <View className={styles.body}>
        <ScrollView className={styles.collegeList} scrollY>
          {mockColleges.map(college => (
            <View
              key={college.id}
              className={classnames(
                styles.collegeItem,
                college.id === activeCollegeId && styles.activeCollege
              )}
              onClick={() => setActiveCollegeId(college.id)}
            >
              <Text className={styles.collegeIcon}>{college.icon}</Text>
              <Text className={styles.collegeName}>{college.name}</Text>
            </View>
          ))}
        </ScrollView>

        <ScrollView className={styles.contentArea} scrollY>
          <Text className={styles.sectionTitle}>🔥 全校热门课程</Text>
          <View className={styles.hotCourses}>
            {hotCourses.map(course => (
              <View
                key={course.id}
                className={styles.hotCourseItem}
                onClick={() => handleHotCourseClick(course)}
              >
                <Text className={styles.hotName}>{course.name}</Text>
                <Text className={styles.hotCode}>{course.code} · {course.collegeName}</Text>
                <Text className={styles.hotBookCount}>📚 {course.bookCount}本在售</Text>
              </View>
            ))}
          </View>

          <Text className={styles.sectionTitle}>
            📖 {activeCollege.name} · 全部课程
          </Text>
          <View className={styles.courseList}>
            {activeCollege.courses.map(course => {
              const bookCount = getBooksByCourse(course.id).length;
              return (
                <View
                  key={course.id}
                  className={styles.courseItem}
                  onClick={() => handleCourseClick(course.id, course.name)}
                >
                  <View className={styles.courseInfo}>
                    <Text className={styles.courseName}>{course.name}</Text>
                    <View className={styles.courseMeta}>
                      <Text>课程代码：{course.code}</Text>
                      <Text>📚 {bookCount}本在售</Text>
                    </View>
                  </View>
                  <Text className={styles.chevron}>›</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

export default CategoryPage;
