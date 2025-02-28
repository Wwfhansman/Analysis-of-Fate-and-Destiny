// history.js
Page({
  data: {
    historyList: [],
    isEmpty: true
  },
  
  onLoad: function() {
    this.loadHistoryData();
  },
  
  onShow: function() {
    // 每次显示页面时重新加载数据，确保数据最新
    this.loadHistoryData();
  },
  
  // 加载历史记录数据
  loadHistoryData: function() {
    const app = getApp();
    const historyList = app.getAnalysisHistory();
    
    this.setData({
      historyList: historyList,
      isEmpty: historyList.length === 0
    });
  },
  
  // 查看历史记录详情
  viewHistoryDetail: function(e) {
    const index = e.currentTarget.dataset.index;
    const historyItem = this.data.historyList[index];
    
    // 将选中的历史记录传递到结果页面，但不保存到历史记录中
    wx.navigateTo({
      url: '/pages/result/result?fromHistory=true',
      success: function(res) {
        // 通过eventChannel向结果页面传送数据
        res.eventChannel.emit('analysisResult', {
          data: historyItem
        });
      }
    });
  },
  
  // 清空历史记录
  clearHistory: function() {
    const that = this;
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有历史记录吗？此操作不可恢复。',
      success(res) {
        if (res.confirm) {
          const app = getApp();
          app.clearAnalysisHistory();
          that.setData({
            historyList: [],
            isEmpty: true
          });
          wx.showToast({
            title: '历史记录已清空',
            icon: 'success'
          });
        }
      }
    });
  },
  
  // 跳转到分析页面
  goToAnalysis: function() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  },
  
  // 格式化时间戳为可读日期
  formatDate: function(timestamp) {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${this.padZero(date.getMonth() + 1)}-${this.padZero(date.getDate())} ${this.padZero(date.getHours())}:${this.padZero(date.getMinutes())}`;
  },
  
  padZero: function(num) {
    return num < 10 ? '0' + num : num;
  }
});
