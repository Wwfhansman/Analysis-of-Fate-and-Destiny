// analysis.js
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
    preferenceIndex: 6,
    isAnalyzing: false
  },

  onLoad() {
    // 页面加载时不设置默认时间
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
      const { workflowId, apiKey } = app.globalData.apiConfig;
      
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

      console.log('请求数据:', JSON.stringify(requestData));

      // 尝试调用API
      let result;
      try {
        // 调用全局API方法
        result = await app.callCezeAPI({
          data: requestData
        });
        console.log('API返回结果:', JSON.stringify(result));
      } catch (apiError) {
        console.error('API调用出错:', apiError);
        // 使用模拟数据
        result = this.getMockData();
      }

      // 检查API调用是否成功，或使用模拟数据
      if ((result && result.code === 0) || result.isMockData) {
        // 处理返回的数据
        const analysisData = this.processAnalysisResult(result);
        
        // 直接跳转到结果页面
        wx.navigateTo({
          url: '/pages/result/result',
          success: function(res) {
            // 传递分析结果到结果页面
            res.eventChannel.emit('analysisResult', { data: analysisData });
          },
          fail: function(err) {
            console.error('跳转到结果页面失败:', err);
            wx.showToast({
              title: '页面跳转失败',
              icon: 'none'
            });
          }
        });
      } else {
        // 如果API调用失败，也使用模拟数据
        console.log('API调用失败，使用模拟数据');
        const mockResult = this.getMockData();
        const analysisData = this.processAnalysisResult(mockResult);
        
        wx.navigateTo({
          url: '/pages/result/result',
          success: function(res) {
            res.eventChannel.emit('analysisResult', { data: analysisData });
          },
          fail: function(err) {
            console.error('跳转到结果页面失败:', err);
            wx.showToast({
              title: '页面跳转失败',
              icon: 'none'
            });
          }
        });
      }
    } catch (error) {
      console.error('分析失败:', error);
      
      // 即使发生错误，也使用模拟数据
      const mockResult = this.getMockData();
      const analysisData = this.processAnalysisResult(mockResult);
      
      wx.navigateTo({
        url: '/pages/result/result',
        success: function(res) {
          res.eventChannel.emit('analysisResult', { data: analysisData });
        },
        fail: function(err) {
          console.error('跳转到结果页面失败:', err);
          wx.showToast({
            title: '页面跳转失败',
            icon: 'none'
          });
        }
      });
    } finally {
      this.setData({ isAnalyzing: false });
    }
  },

  // 获取偏好文本，'家庭', '学业', '健康', '事业', '姻缘', '财运', '综合'
  getPreferenceText() {
    const preferenceMap = {
      0: '家庭',
      1: '学业',
      2: '健康',
      3: '事业',
      4: '姻缘',
      5: '财运',
      6: '综合'
    };
    return preferenceMap[this.data.preferenceIndex] || '综合';
  },

  // 处理分析结果
  processAnalysisResult(result) {
    console.log('处理分析结果:', JSON.stringify(result));
    
    // 如果是模拟数据，直接使用
    if (result.isMockData) {
      console.log('使用模拟数据结果');
      return {
        currentDate: this.getFormattedDate(),
        birthInfo: this.getBirthInfoText(),
        analysisContent: result.data.content,
        rawResult: result
      };
    }
    
    // 处理API返回的数据
    try {
      // 获取原始内容
      let content = '';
      
      // 检查不同的数据结构
      if (result.data && typeof result.data === 'object') {
        if (result.data.content) {
          // 直接包含content字段
          content = result.data.content;
        } else if (result.data.result && result.data.result.content) {
          // 嵌套在result.content中
          content = result.data.result.content;
        } else if (Array.isArray(result.data.messages)) {
          // 在messages数组中
          const message = result.data.messages.find(msg => msg.content);
          if (message) {
            content = message.content;
          }
        } else if (result.data.response && result.data.response.content) {
          // 在response.content中
          content = result.data.response.content;
        }
      }
      
      // 如果没有找到内容，尝试提取
      if (!content && result.data) {
        content = this.extractContent(result.data);
      }
      
      // 如果仍然没有内容，使用默认内容
      if (!content) {
        console.warn('无法从API响应中提取内容，使用默认内容');
        content = '抱歉，无法生成分析结果，请重试。';
      }
      
      // 格式化内容
      const formattedContent = this.formatContent(content);
      
      // 返回处理后的结果
      return {
        currentDate: this.getFormattedDate(),
        birthInfo: this.getBirthInfoText(),
        analysisContent: formattedContent,
        rawResult: result
      };
    } catch (error) {
      console.error('处理分析结果时出错:', error);
      
      // 出错时返回默认结果
      return {
        currentDate: this.getFormattedDate(),
        birthInfo: this.getBirthInfoText(),
        analysisContent: '抱歉，处理分析结果时出错，请重试。',
        error: error.message
      };
    }
  },

  // 从API响应中提取内容
  extractContent(data) {
    console.log('提取内容，原始数据类型:', typeof data);
    console.log('提取内容，原始数据:', data);
    
    // 检查各种可能的数据结构
    if (data && data.content) {
      console.log('找到content字段');
      return data.content;
    } else if (data && typeof data === 'string') {
      console.log('数据是字符串');
      return data;
    } else if (data && data.result && data.result.content) {
      console.log('找到result.content字段');
      return data.result.content;
    } else if (data && data.response) {
      console.log('找到response字段');
      return data.response;
    } else if (data && data.result && data.result.response) {
      console.log('找到result.response字段');
      return data.result.response;
    } else if (data && data.result && typeof data.result === 'string') {
      console.log('result是字符串');
      return data.result;
    } else if (data && data.text) {
      console.log('找到text字段');
      return data.text;
    } else if (data && data.message) {
      console.log('找到message字段');
      return data.message;
    } else {
      // 如果没有找到内容，返回一个默认消息
      console.warn('未找到有效的内容字段');
      return '无法获取分析内容，请稍后重试。';
    }
  },

  // 格式化内容，使其更易读
  formatContent(content) {
    if (!content) return '无内容';
    
    // 替换多个换行符为两个换行符
    content = content.replace(/\n{3,}/g, '\n\n');
    
    // 添加段落标题的格式化
    content = content.replace(/^(.*?)：/gm, '【$1】：');
    
    // 确保每个段落之间有足够的空行
    content = content.replace(/\n(?!\n)/g, '\n\n');
    
    // 移除多余的空格
    content = content.replace(/ {2,}/g, ' ');
    
    // 添加一些强调
    content = content.replace(/(吉星|凶星|大运|流年|命主|财运|事业|婚姻|健康|学业)/g, '【$1】');
    
    return content;
  },

  // 获取模拟数据
  getMockData() {
    console.log('使用模拟数据');
    return {
      isMockData: true,
      data: {
        content: `【基本命盘分析】
您出生于${this.data.year}年${parseInt(this.data.monthIndex) + 1}月${parseInt(this.data.dayIndex) + 1}日${this.data.hourIndex}时，根据传统命理学分析如下：

【性格特点】
您性格温和，做事稳重，有较强的责任感和执行力。思维缜密，善于分析问题，但有时可能过于追求完美。在人际交往中，您待人真诚，但也有一定的防备心理，需要时间建立信任。

【事业发展】
您的事业运势起伏有度，需要通过自身努力来稳定发展。适合从事需要细心和耐心的工作，如研究、分析、教育等领域。事业上的成功不会一蹴而就，需要长期积累和沉淀。建议在30-35岁期间把握重要机遇，可能会有事业上的重大突破。

【财富状况】
财运中等偏上，但需要理性规划和管理。不适合高风险投资，稳健的理财方式更适合您。35岁后财运会有明显好转，但仍需谨慎理财，避免冲动消费和投资。

【健康状况】
体质较为中和，但需要注意消化系统和呼吸系统的保养。建议保持规律作息，适当运动，避免过度劳累。40岁后需特别关注心脑血管健康。

【人际关系】
您在人际关系中较为被动，但能够维持长久的友谊。建议主动扩展社交圈，增强人际互动能力。在与人相处时，可以适当表达自己的想法和需求，避免过度迁就他人。

【婚姻家庭】
婚姻缘分较迟，但质量较高。与伴侣相处需要更多的包容和理解。家庭生活总体和谐，但需要投入更多时间和精力来维护家庭关系。

【学业发展】
学习能力强，但可能缺乏持久的专注力。适合系统性学习，而非跳跃式学习。在选择专业和发展方向时，应结合自身兴趣和市场需求，做出理性决策。

【未来展望】
未来五年是您人生的关键期，会有较多机遇和挑战并存。建议保持开放心态，积极把握机会，同时做好风险防范。通过不断学习和自我提升，您的人生将会逐步向好发展。

*注：本分析仅供参考，请理性看待。人生的发展主要取决于个人的努力和选择，而非命理预测。*`
      }
    };
  },

  // 获取格式化的当前日期
  getFormattedDate() {
    const currentDate = new Date();
    return `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月${currentDate.getDate()}日`;
  },

  // 获取出生信息文本
  getBirthInfoText() {
    return `${this.data.year}年${parseInt(this.data.monthIndex) + 1}月${parseInt(this.data.dayIndex) + 1}日 ${this.data.hourIndex}时`;
  },
});
