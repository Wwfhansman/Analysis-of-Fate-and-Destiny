Page({
  data: {
    currentDate: '',
    analysisContent: '',
    birthInfo: '', // 用户出生信息
    fromHistory: false // 是否来自历史记录页面
  },

  onLoad: function(options) {
    // 检查是否来自历史记录页面
    if (options && options.fromHistory) {
      this.setData({
        fromHistory: true
      });
    }
    
    // 获取分析结果数据
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('analysisResult', (data) => {
      if (!data || !data.data) {
        this.setDefaultData();
        return;
      }

      const result = data.data;
      
      // 设置日期和出生信息
      this.setData({
        currentDate: result.currentDate || this.getFormattedDate(),
        birthInfo: result.birthInfo || '',
        analysisContent: result.analysisContent || (result.analysisResult && result.analysisResult[0] ? 
          result.analysisResult[0].content : '暂无分析结果')
      });
      
      // 只有不是来自历史记录页面才保存到历史记录
      if (!this.data.fromHistory) {
        this.saveToHistory(result);
      }
    });
  },
  
  // 保存到历史记录
  saveToHistory: function(result) {
    try {
      const app = getApp();
      // 简化历史记录数据，只保留必要信息
      const historyData = {
        currentDate: result.currentDate || this.getFormattedDate(),
        birthInfo: result.birthInfo || '',
        analysisContent: result.analysisContent || (result.analysisResult && result.analysisResult[0] ? 
          result.analysisResult[0].content : '暂无分析结果')
      };
      app.saveAnalysisHistory(historyData);
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  },

  // 设置默认数据
  setDefaultData() {
    this.setData({
      currentDate: this.getFormattedDate(),
      analysisContent: '暂无分析结果，请返回重试'
    });
  },

  // 获取格式化的当前日期
  getFormattedDate() {
    const now = new Date();
    return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
  },

  // 返回首页
  goBack() {
    wx.navigateBack({
      delta: 1
    });
  },

  // 分享功能
  onShareAppMessage: function() {
    return {
      title: '我的命理分析结果',
      path: '/pages/index/index',
      imageUrl: '/images/share-img.png' // 需要添加分享图片
    };
  }
});