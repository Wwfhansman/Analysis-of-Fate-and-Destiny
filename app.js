// app.js
App({

  onLaunch: function() {
    // 初始化云开发环境
    if (wx.cloud) {
      wx.cloud.init({
        env: 'your-env-id', // 替换为你的云开发环境ID
        traceUser: true
      });
    } else {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    }
    
    // 获取系统信息
    const systemInfo = wx.getSystemInfoSync();
    this.globalData.systemInfo = systemInfo;
    
    // 检查更新
    this.checkUpdate();
    
    // 设置请求拦截器
    this.setupRequestInterceptor();
    
    // 检查域名配置
    this.checkDomainConfig();
  },
  
  // 检查小程序更新
  checkUpdate: function() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager();
      updateManager.onCheckForUpdate(function(res) {
        if (res.hasUpdate) {
          updateManager.onUpdateReady(function() {
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success: function(res) {
                if (res.confirm) {
                  updateManager.applyUpdate();
                }
              }
            });
          });
          
          updateManager.onUpdateFailed(function() {
            wx.showModal({
              title: '更新提示',
              content: '新版本下载失败，请检查网络后重试',
              showCancel: false
            });
          });
        }
      });
    }
  },
  
  // 设置请求拦截器
  setupRequestInterceptor: function() {
    // 记录原始的wx.request方法
    const originalRequest = wx.request;
    
    // 重写wx.request方法
    Object.defineProperty(wx, 'request', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: (options) => {
        // 处理API请求错误
        const originalFail = options.fail;
        options.fail = (res) => {
          console.error('请求失败:', res);
          // 显示错误提示
          wx.showToast({
            title: '网络请求失败，请检查网络',
            icon: 'none'
          });
          
          // 调用原始的fail回调
          if (originalFail) {
            originalFail(res);
          }
        };
        
        // 调用原始的request方法
        return originalRequest(options);
      }
    });
  },
  
  // 检查域名配置
  checkDomainConfig: function() {
    // 仅在开发环境下提示
    if (wx.getAccountInfoSync().miniProgram.envVersion === 'develop') {
      console.log('当前处于开发环境，请确保已在微信开发者工具中勾选"不校验合法域名"选项');
      wx.showModal({
        title: '开发环境提示',
        content: '请在微信开发者工具中勾选"不校验合法域名"选项，否则API请求可能会失败。正式环境需在微信公众平台添加 api.coze.cn 为合法域名。',
        showCancel: false
      });
    }
  },
  
  // 调用CEZE API的通用方法
  callCezeAPI: function(options) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: 'https://api.coze.cn/v1/workflow/run',
        method: 'POST',
        data: options.data,
        header: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.globalData.apiConfig.apiKey}`
        },
        success: (res) => {
          if (res.statusCode === 200) {
            resolve(res.data);
          } else {
            reject(new Error(`请求失败: ${res.statusCode}`));
          }
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  },
  

  
  globalData: {
    userInfo: null,
    systemInfo: null,
    // API配置
    apiConfig: {
      baseUrl: 'https://api.coze.cn/v1',
      apiKey: 'pat_1nzSWhjsKjAPcGBbEmgZ9msxelvLOLXJvMptHGYf7CUUkdng7Ea0LAyVD5aagAjN',
      workflowId: '7476126505999794239'
    }
  }
});
