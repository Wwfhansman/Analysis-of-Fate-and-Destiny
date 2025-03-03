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
    preferenceIndex: 6,
    isAnalyzing: false,
    currentDate: new Date().toISOString().split('T')[0], // 当前选择的日期，格式：YYYY-MM-DD
    formattedDate: '', // 格式化后的日期显示
    notes: [], // 当前日期的笔记列表
    showModal: false, // 是否显示添加/编辑笔记弹窗
    currentMood: '开心', // 当前选择的心情
    currentTitle: '', // 当前编辑的标题
    currentContent: '', // 当前编辑的内容
    editingNoteId: null // 当前正在编辑的笔记ID，为null表示新增
  },

  onLoad() {
    // 页面加载时不设置默认时间
    this.formatCurrentDate();
    this.loadNotes();
  },

  onShow() {
    // 每次页面显示时重新加载笔记
    this.loadNotes();
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
  },

  // 格式化当前日期为显示格式
  formatCurrentDate() {
    const date = new Date(this.data.currentDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdays[date.getDay()];
    const formattedDate = `${year}年${month}月${day}日 ${weekday}`;
    this.setData({ formattedDate });
  },

  // 日期选择器变更
  onDateChange(e) {
    this.setData({
      currentDate: e.detail.value
    });
    this.formatCurrentDate();
    this.loadNotes();
  },

  // 加载指定日期的笔记
  loadNotes() {
    const date = this.data.currentDate;
    // 从本地存储获取所有笔记
    const allNotes = wx.getStorageSync('notes') || {};
    // 获取当前日期的笔记
    const dateNotes = allNotes[date] || [];
    
    // 按时间倒序排列
    const sortedNotes = dateNotes.sort((a, b) => {
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
    
    this.setData({
      notes: sortedNotes
    });
  },

  // 显示添加笔记弹窗
  showNoteModal() {
    this.setData({
      showModal: true,
      currentMood: '开心',
      currentTitle: '',
      currentContent: '',
      editingNoteId: null
    });
  },

  // 隐藏弹窗
  hideModal() {
    this.setData({
      showModal: false
    });
  },

  // 选择心情
  selectMood(e) {
    this.setData({
      currentMood: e.currentTarget.dataset.mood
    });
  },

  // 标题输入
  onTitleInput(e) {
    this.setData({
      currentTitle: e.detail.value
    });
  },

  // 内容输入
  onContentInput(e) {
    this.setData({
      currentContent: e.detail.value
    });
  },

  // 编辑已有笔记
  editNote(e) {
    const noteId = e.currentTarget.dataset.id;
    const note = this.data.notes.find(n => n.id === noteId);
    
    if (note) {
      this.setData({
        showModal: true,
        currentMood: note.mood,
        currentTitle: note.title,
        currentContent: note.content,
        editingNoteId: noteId
      });
    }
  },

  // 保存笔记
  saveNote() {
    const { currentDate, currentMood, currentTitle, currentContent, editingNoteId } = this.data;
    
    // 验证内容不能为空
    if (!currentContent.trim()) {
      wx.showToast({
        title: '内容不能为空',
        icon: 'none'
      });
      return;
    }
    
    // 获取所有笔记
    const allNotes = wx.getStorageSync('notes') || {};
    // 获取当前日期的笔记
    const dateNotes = allNotes[currentDate] || [];
    
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    if (editingNoteId) {
      // 编辑已有笔记
      const noteIndex = dateNotes.findIndex(n => n.id === editingNoteId);
      if (noteIndex !== -1) {
        dateNotes[noteIndex] = {
          ...dateNotes[noteIndex],
          mood: currentMood,
          title: currentTitle,
          content: currentContent,
          time: timeString,
          timestamp: now.getTime()
        };
      }
    } else {
      // 添加新笔记
      const newNote = {
        id: now.getTime().toString(), // 使用时间戳作为ID
        mood: currentMood,
        title: currentTitle,
        content: currentContent,
        time: timeString,
        timestamp: now.getTime()
      };
      dateNotes.push(newNote);
    }
    
    // 更新存储
    allNotes[currentDate] = dateNotes;
    wx.setStorageSync('notes', allNotes);
    
    // 刷新列表并关闭弹窗
    this.loadNotes();
    this.hideModal();
    
    wx.showToast({
      title: editingNoteId ? '修改成功' : '添加成功',
      icon: 'success'
    });
  }
});
