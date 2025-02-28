// index.js
Page({
  data: {
    year: '',
    month: '',
    day: '',
    hour: '',
    // 新增选择器数据
    months: Array.from({length: 12}, (_, i) => i + 1 + '月'),
    days: Array.from({length: 31}, (_, i) => i + 1 + '日'),
    hours: Array.from({length: 24}, (_, i) => i + '时'),
    monthIndex: null,
    dayIndex: null,
    hourIndex: null,
    preferences: ['家庭', '学业', '健康', '事业', '姻缘', '财运', '综合'],
    preferenceIndex: 3,
    isAnalyzing: false
  },

  onLoad() {
    // 页面加载时的初始化逻辑
    // 设置默认日期为当前日期
    const now = new Date();
    this.setData({
      year: now.getFullYear().toString(),
      monthIndex: now.getMonth(),
      dayIndex: now.getDate() - 1,
      hourIndex: now.getHours()
    });
  },

  onPreferenceChange(e) {
    this.setData({
      preferenceIndex: e.detail.value
    });
  },

  onMonthChange(e) {
    this.setData({
      monthIndex: e.detail.value,
      month: (parseInt(e.detail.value) + 1).toString()
    });
    this.updateDaysInMonth();
  },

  onDayChange(e) {
    this.setData({
      dayIndex: e.detail.value,
      day: (parseInt(e.detail.value) + 1).toString()
    });
  },

  onHourChange(e) {
    this.setData({
      hourIndex: e.detail.value,
      hour: e.detail.value.toString()
    });
  },

  // 根据年月更新天数
  updateDaysInMonth() {
    const { year, monthIndex } = this.data;
    if (!year || monthIndex === null) return;
    
    const daysInMonth = new Date(parseInt(year), parseInt(monthIndex) + 1, 0).getDate();
    const days = Array.from({length: daysInMonth}, (_, i) => i + 1 + '日');
    
    this.setData({
      days,
      // 如果当前选择的日期超过了该月的最大天数，则重置为该月的最后一天
      dayIndex: this.data.dayIndex >= daysInMonth ? daysInMonth - 1 : this.data.dayIndex
    });
  },

  // 验证输入数据
  validateInput() {
    const { year, monthIndex, dayIndex, hourIndex } = this.data;
    
    if (!year || monthIndex === null || dayIndex === null || hourIndex === null) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return false;
    }

    // 年份简单验证
    if (parseInt(year) < 1900 || parseInt(year) > 2100) {
      wx.showToast({
        title: '请输入有效的年份(1900-2100)',
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  // 开始分析
  async startAnalysis() {
    if (!this.validateInput()) return;

    // 显示自定义加载动画
    this.setData({ isAnalyzing: true });

    try {
      // 获取全局配置
      const app = getApp();
      const { workflowId } = app.globalData.apiConfig;
      
      // 构建请求数据
      const requestData = {
        workflow_id: workflowId,
        parameters: {
          year: parseInt(this.data.year),
          month: parseInt(this.data.monthIndex) + 1,
          day: parseInt(this.data.dayIndex) + 1,
          hour: parseInt(this.data.hourIndex),
          pianhao: this.getPreferenceText()
        }
      };

      // 调用全局API方法
      const result = await app.callCezeAPI({
        data: requestData
      });

      // 检查API调用是否成功
      if (result && result.code === 0) {
        // 处理返回的数据
        const analysisData = this.processAnalysisResult(result);
        
        // 跳转到结果页面
        wx.navigateTo({
          url: '/pages/result/result',
          success: function(res) {
            // 传递分析结果到结果页面
            res.eventChannel.emit('analysisResult', { data: analysisData });
          }
        });
      } else {
        throw new Error(result.msg || '分析失败');
      }
    } catch (error) {
      wx.showToast({
        title: error.message || '分析失败，请重试',
        icon: 'none'
      });
      console.error('分析失败:', error);
    } finally {
      this.setData({ isAnalyzing: false });
    }
  },

  // 获取偏好文本
  getPreferenceText() {
    const preferenceMap = {
      0: '事业',
      1: '爱情',
      2: '财运',
      3: '综合'
    };
    return preferenceMap[this.data.preferenceIndex] || '综合';
  },

  // 处理分析结果
  processAnalysisResult(apiResult) {
    try {
      // 假设API返回的数据格式为JSON字符串
      let resultData = apiResult.data;
      if (typeof resultData === 'string') {
        try {
          resultData = JSON.parse(resultData);
        } catch (e) {
          // 如果不是JSON格式，则保持原样
          console.warn('API返回的数据不是有效的JSON格式:', e);
        }
      }

      // 构建分析结果对象
      const currentDate = new Date();
      const formattedDate = `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月${currentDate.getDate()}日`;
      
      const birthInfo = `${this.data.year}年${parseInt(this.data.monthIndex) + 1}月${parseInt(this.data.dayIndex) + 1}日 ${this.data.hourIndex}时`;
      
      // 获取并格式化内容
      let content = this.extractContent(resultData);
      content = this.formatContent(content);
      
      // 简化为单一结果
      const analysisResult = [
        {
          title: '命理总论',
          content: content
        }
      ];

      return {
        currentDate: formattedDate,
        birthInfo: birthInfo,
        analysisResult: analysisResult,
        rawData: resultData // 保存原始数据，以备后用
      };
    } catch (error) {
      console.error('处理分析结果失败:', error);
      // 返回默认结果
      return {
        currentDate: new Date().toLocaleDateString('zh-CN'),
        birthInfo: `${this.data.year}年${parseInt(this.data.monthIndex) + 1}月${parseInt(this.data.dayIndex) + 1}日 ${this.data.hourIndex}时`,
        analysisResult: [
          {
            title: '命理总论',
            content: '数据处理异常，请重试。'
          }
        ]
      };
    }
  },
  
  // 从API响应中提取内容
  extractContent(data) {
    if (!data) return "无法获取分析结果";
    
    // 如果数据是字符串，则直接返回
    if (typeof data === 'string') return data;
    
    // 尝试获取各种可能的字段
    if (data.output) return data.output;
    if (data.content) return data.content;
    if (data.text) return data.text;
    if (data.result) {
      if (typeof data.result === 'string') return data.result;
      if (data.result.output) return data.result.output;
      if (data.result.content) return data.result.content;
      if (data.result.text) return data.result.text;
    }
    
    // 如果都没有找到，则返回整个数据对象的字符串表示
    return JSON.stringify(data);
  },
  
  // 格式化内容，使其更易读
  formatContent(content) {
    if (!content) return "无法获取分析结果";
    
    // 替换多余的换行符
    content = content.replace(/\n{3,}/g, '\n\n');
    
    // 替换杂乱的标点
    content = content.replace(/\.{2,}/g, '。');
    content = content.replace(/\,{2,}/g, '，');
    
    // 统一标题格式
    // 先移除现有的标记
    content = content.replace(/\*\*([^*]+)\*\*/g, '$1');
    content = content.replace(/###([^#]+)###/g, '$1');
    content = content.replace(/\[\[([^\]]+)\]\]/g, '$1');
    
    // 识别并格式化主标题（使用【】）
    content = content.replace(/(?:^|\n)([^：\n]{2,10})(：|\:)/gm, '\n\n【$1】\n');
    
    // 识别并格式化子标题（使用-）
    content = content.replace(/(?:^|\n)(\s*)([\-\*])(\s*)([^：\n]{2,15})(：|\:)/gm, '\n- 【$4】\n');
    
    // 清理多余的空格
    content = content.replace(/\s{2,}/g, ' ');
    
    // 确保段落之间有适当的空行
    content = content.replace(/([。！？])\s*(?=\S)/g, '$1\n\n');
    
    // 移除连续的换行符
    content = content.replace(/\n{3,}/g, '\n\n');
    
    return content;
  }
});
