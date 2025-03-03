Page({
  data: {
    avatarUrl: '/images/default-avatar.png',
    userInfo: null,
    hasUserInfo: false
  },

  onLoad() {
    // 检查是否有缓存的用户信息
    const userInfo = wx.getStorageSync('userInfo');
    const avatarUrl = wx.getStorageSync('avatarUrl');
    
    if (userInfo && avatarUrl) {
      this.setData({
        userInfo,
        avatarUrl,
        hasUserInfo: true
      });
    }
  },

  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    this.setData({
      avatarUrl,
      hasUserInfo: true
    });
    wx.setStorageSync('avatarUrl', avatarUrl);
  },



  navigateToAnalysis() {
    wx.navigateTo({
      url: '/pages/analysis/analysis'
    });
  },

  navigateToTheory() {
    wx.navigateTo({
      url: '/pages/theory/theory'
    });
  },

  showContact() {
    wx.showModal({
      title: '联系我们',
      content: '如有问题请添加客服微信：faxJiu',
      showCancel: false
    });
  }
});