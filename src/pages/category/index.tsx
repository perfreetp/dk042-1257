import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { mockColleges } from '@/data/colleges';
import { getBooksByCourse, getBooksByCollege, searchBooks } from '@/data/books';
import BookCard from '@/components/BookCard';
import EmptyState from '@/components/EmptyState';
import { useAppStore } from '@/store/app';
import styles from './index.module.scss';

const CategoryPage: React.FC = () => {
  const [activeCollegeId, setActiveCollegeId] = useState(mockColleges[0].id);
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const { setSearchKeyword, setSearchType } = useAppStore();

  const activeCollege = useMemo(
    () => mockColleges.find(c => c.id === activeCollegeId) || mockColleges[0],
    [activeCollegeId]
  );

  const collegeBookCount = useMemo(() => {
    return getBooksByCollege(activeCollege.name).length;
  }, [activeCollege]);

  const hotCourses = useMemo(() => {
    const all = mockColleges.flatMap(c =>
      c.courses.map(course => ({
        ...course,
        collegeName: c.name,
        realCount: getBooksByCourse(course.code).length
      }))
    );
    return all.sort((a, b) => b.realCount - a.realCount).slice(0, 4);
  }, []);

  const collegeCourses = useMemo(() => {
    return activeCollege.courses.map(c => ({
      ...c,
      realCount: getBooksByCourse(c.code).length
    }));
  }, [activeCollege]);

  const displayBooks = useMemo(() => {
    if (activeCourseId) {
      const course = mockColleges.flatMap(c => c.courses).find(c => c.id === activeCourseId);
      if (course) {
        return getBooksByCourse(course.code);
      }
      return getBooksByCourse(activeCourseId);
    }
    return [];
  }, [activeCourseId]);

  const activeCourseName = useMemo(() => {
    if (!activeCourseId) return '';
    const allCourses = mockColleges.flatMap(c => c.courses);
    const course = allCourses.find(c => c.id === activeCourseId);
    return course?.name || '';
  }, [activeCourseId]);

  const handleCollegeClick = (collegeId: string) => {
    setActiveCollegeId(collegeId);
    setActiveCourseId(null);
  };

  const handleCourseClick = (courseId: string, courseName: string) => {
    setActiveCourseId(prev => prev === courseId ? null : courseId);
  };

  const handleHotCourseClick = (course: any) => {
    setActiveCourseId(prev => prev === course.id ? null : course.id);
    const college = mockColleges.find(c => c.courses.some(cs => cs.id === course.id));
    if (college) {
      setActiveCollegeId(college.id);
    }
  };

  const handleSearchFromCourse = (courseName: string) => {
    setSearchKeyword(courseName);
    setSearchType('course');
    Taro.switchTab({ url: '/pages/home/index' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>📂 分类浏览</Text>
        <Text className={styles.headerDesc}>按学院课程查找，精准定位所需教材</Text>
      </View>

      <View className={styles.body}>
        <ScrollView className={styles.collegeList} scrollY>
          {mockColleges.map(college => {
            const count = getBooksByCollege(college.name).length;
            return (
              <View
                key={college.id}
                className={classnames(
                  styles.collegeItem,
                  college.id === activeCollegeId && styles.activeCollege
                )}
                onClick={() => handleCollegeClick(college.id)}
              >
                <Text className={styles.collegeIcon}>{college.icon}</Text>
                <Text className={styles.collegeName}>{college.name}</Text>
                <Text className={styles.collegeCount}>{count}本</Text>
              </View>
            );
          })}
        </ScrollView>

        <ScrollView className={styles.contentArea} scrollY>
          {activeCourseId ? (
            <View className={styles.bookListSection}>
              <View className={styles.sectionHeader}>
                <View>
                  <Text className={styles.sectionTitle}>📚 《{activeCourseName}》</Text>
                  <Text className={styles.sectionSub}>共 {displayBooks.length} 本在售教材</Text>
                </View>
                <Text
                  className={styles.backBtn}
                  onClick={() => setActiveCourseId(null)}
                >
                  ← 返回课程
                </Text>
              </View>
              {displayBooks.length === 0 ? (
                <EmptyState
                  icon="📖"
                  title="暂无该课程教材"
                  desc="可以设置缺书提醒，有书了第一时间通知你"
                />
              ) : (
                <View className={styles.bookList}>
                  {displayBooks.map(book => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </View>
              )}
            </View>
          ) : (
            <>
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
                    <Text className={styles.hotBookCount}>📚 {course.realCount}本在售</Text>
                  </View>
                ))}
              </View>

              <View className={styles.collegeSectionHeader}>
                <Text className={styles.sectionTitle}>
                  📖 {activeCollege.name}
                </Text>
                <Text className={styles.collegeTotal}>共 {collegeBookCount} 本</Text>
              </View>
              <View className={styles.courseList}>
                {collegeCourses.map(course => (
                  <View
                    key={course.id}
                    className={classnames(
                      styles.courseItem,
                      activeCourseId === course.id && styles.activeCourse
                    )}
                    onClick={() => handleCourseClick(course.id, course.name)}
                  >
                    <View className={styles.courseInfo}>
                      <Text className={styles.courseName}>{course.name}</Text>
                      <View className={styles.courseMeta}>
                        <Text>课程代码：{course.code}</Text>
                        <Text className={styles.countTag}>📚 {course.realCount}本在售</Text>
                      </View>
                    </View>
                    <Text className={styles.chevron}>›</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default CategoryPage;
