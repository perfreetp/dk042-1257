export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/category/index',
    'pages/publish/index',
    'pages/orders/index',
    'pages/mine/index',
    'pages/detail/index',
    'pages/bargain/index',
    'pages/appointment/index',
    'pages/bookalert/index',
    'pages/pricechart/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#2B7FFF',
    navigationBarTitleText: '书易换',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F5F7FA'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#2B7FFF',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/category/index',
        text: '分类'
      },
      {
        pagePath: 'pages/publish/index',
        text: '发布'
      },
      {
        pagePath: 'pages/orders/index',
        text: '订单'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
