Page({
  data: {
    currentDate: '',
    analysisContent: '',
    birthInfo: '', // 用户出生信息
    fromHistory: false, // 是否来自历史记录页面
    isLoading: true // 加载状态
  },

  onLoad: function(options) {
    console.log('结果页面加载');
    
    // 获取事件通道
    const eventChannel = this.getOpenerEventChannel();
    
    // 监听analysisResult事件，获取分析结果
    eventChannel.on('analysisResult', (res) => {
      console.log('接收到分析结果数据:', JSON.stringify(res));
      
      if (!res || !res.data) {
        console.error('接收到的数据格式不正确');
        this.setData({
          analysisContent: '抱歉，分析结果获取失败，请重试。',
          isLoading: false
        });
        return;
      }
      
      let content = '';
      
      // 检查是否有直接的analysisContent字段
      if (res.data.analysisContent) {
        console.log('使用直接的analysisContent字段');
        content = res.data.analysisContent;
      } 
      // 检查是否有content字段
      else if (res.data.content) {
        console.log('使用content字段');
        content = res.data.content;
      }
      // 检查是否有data.content字段
      else if (res.data.data && res.data.data.content) {
        console.log('使用data.content字段');
        content = res.data.data.content;
      } else {
        console.error('无法找到有效的分析内容');
        content = '抱歉，无法解析分析结果，请重试。';
      }
      
      // 处理文本内容，替换转义字符并格式化
      const formattedContent = this.formatAnalysisContent(content);
      
      this.setData({
        currentDate: res.data.currentDate || this.getFormattedDate(),
        birthInfo: res.data.birthInfo || '',
        analysisContent: formattedContent,
        isLoading: false
      });
      
      // 保存到历史记录
      if (!this.data.fromHistory) {
        this.saveToHistory({
          currentDate: this.data.currentDate,
          birthInfo: this.data.birthInfo,
          analysisContent: this.data.analysisContent
        });
      }
    });
  },
  
  // 保存到历史记录
  saveToHistory: function(result) {
    try {
      let history = wx.getStorageSync('analysis_history') || [];
      history.unshift({
        id: Date.now(),
        date: result.currentDate,
        birthInfo: result.birthInfo,
        content: result.analysisContent,
        timestamp: new Date().getTime()
      });
      if (history.length > 50) {
        history = history.slice(0, 50);
      }
      wx.setStorageSync('analysis_history', history);
      console.log('历史记录保存成功');
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  },

  // 设置默认数据
  setDefaultData() {
    console.log('设置默认数据');
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
  },
  
  // 格式化分析内容
  formatAnalysisContent: function(content) {
    if (!content) return '';
    
    // 替换转义的换行符为实际换行
    let formatted = content.replace(/\\n/g, '\n');
    
    // 替换多个连续换行为两个换行（保持段落间距）
    formatted = formatted.replace(/\n{3,}/g, '\n\n');
    
    // 确保【】标记的内容有适当的格式
    formatted = formatted.replace(/【([^】]+)】/g, '【$1】\n');
    
    // 移除任何HTML标签
    formatted = formatted.replace(/<[^>]*>/g, '');
    
    // 移除多余的空格
    formatted = formatted.replace(/\s{2,}/g, ' ');
    
    // 确保以换行开始，以便第一行也有适当的格式
    if (!formatted.startsWith('\n')) {
      formatted = '\n' + formatted;
    }
    
    return formatted;
  },
  
  // 保存到收藏
  saveToFavorites: function() {
    try {
      // 获取当前分析结果
      const favouriteItem = {
        date: this.data.currentDate,
        birthInfo: this.data.birthInfo,
        content: this.data.analysisContent,
        timestamp: new Date().getTime()
      };
      
      // 获取已有的收藏列表
      let favourites = wx.getStorageSync('favourites') || [];
      
      // 添加到收藏列表
      favourites.unshift(favouriteItem);
      
      // 限制收藏数量，最多保存20条
      if (favourites.length > 20) {
        favourites = favourites.slice(0, 20);
      }
      
      // 保存到本地存储
      wx.setStorageSync('favourites', favourites);
      
      // 提示用户
      wx.showToast({
        title: '已收藏',
        icon: 'success',
        duration: 2000
      });
    } catch (error) {
      console.error('保存收藏失败:', error);
      wx.showToast({
        title: '收藏失败',
        icon: 'none',
        duration: 2000
      });
    }
  },
  
  // 分享结果
  shareResult: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  }
});