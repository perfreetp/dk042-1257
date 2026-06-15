import type { College } from '@/types';

export const mockColleges: College[] = [
  {
    id: 'c1',
    name: '计算机学院',
    icon: '💻',
    courses: [
      { id: 'cs101', name: '数据结构', code: 'CS101', bookCount: 56 },
      { id: 'cs102', name: '计算机网络', code: 'CS102', bookCount: 43 },
      { id: 'cs103', name: '操作系统', code: 'CS103', bookCount: 38 },
      { id: 'cs104', name: '数据库原理', code: 'CS104', bookCount: 31 },
      { id: 'cs105', name: '算法设计与分析', code: 'CS105', bookCount: 28 }
    ]
  },
  {
    id: 'c2',
    name: '经济管理学院',
    icon: '📊',
    courses: [
      { id: 'eco101', name: '微观经济学', code: 'ECO101', bookCount: 62 },
      { id: 'eco102', name: '宏观经济学', code: 'ECO102', bookCount: 51 },
      { id: 'eco103', name: '管理学原理', code: 'MGT101', bookCount: 47 },
      { id: 'eco104', name: '会计学基础', code: 'ACC101', bookCount: 39 }
    ]
  },
  {
    id: 'c3',
    name: '机械工程学院',
    icon: '⚙️',
    courses: [
      { id: 'me101', name: '工程力学', code: 'ME101', bookCount: 34 },
      { id: 'me102', name: '机械设计基础', code: 'ME102', bookCount: 29 },
      { id: 'me103', name: '材料力学', code: 'ME103', bookCount: 25 }
    ]
  },
  {
    id: 'c4',
    name: '外国语学院',
    icon: '📚',
    courses: [
      { id: 'fl101', name: '大学英语', code: 'ENG101', bookCount: 88 },
      { id: 'fl102', name: '高级英语', code: 'ENG201', bookCount: 36 },
      { id: 'fl103', name: '日语入门', code: 'JPN101', bookCount: 22 }
    ]
  },
  {
    id: 'c5',
    name: '数学学院',
    icon: '📐',
    courses: [
      { id: 'math101', name: '高等数学', code: 'MATH101', bookCount: 94 },
      { id: 'math102', name: '线性代数', code: 'MATH102', bookCount: 67 },
      { id: 'math103', name: '概率论与数理统计', code: 'MATH103', bookCount: 58 }
    ]
  },
  {
    id: 'c6',
    name: '物理学院',
    icon: '🔬',
    courses: [
      { id: 'phy101', name: '大学物理', code: 'PHY101', bookCount: 72 },
      { id: 'phy102', name: '电磁学', code: 'PHY201', bookCount: 24 }
    ]
  }
];
