# 命理分析小程序

## 项目概述

命理分析小程序是一款基于微信小程序平台开发的应用，通过用户输入的出生年、月、日、时信息，调用CEZE大模型API进行命理分析，并提供相关的运势解读。

## 功能特点

- **命理分析**：根据用户出生信息进行命理分析
- **多维度解读**：提供事业、感情、财运、健康等多个维度的分析
- **个性化推理**：支持用户选择不同的推理偏好
- **结果分享**：支持将分析结果分享给好友
- **用户中心**：提供用户信息管理、历史记录查询等功能

## 技术架构

### 前端

- 微信小程序原生开发框架
- WXML、WXSS、JavaScript
- 组件化开发

### 后端

- 微信云开发（CloudBase）
- CEZE大模型API接口

## 项目结构

```
├── app.js                 // 应用程序入口文件
├── app.json               // 应用程序配置文件
├── app.wxss               // 应用程序全局样式
├── components/            // 自定义组件
├── images/                // 图片资源
├── pages/                 // 页面文件
│   ├── index/             // 首页（输入信息页）
│   ├── result/            // 结果页
│   └── my/                // 我的页面
└── project.config.json    // 项目配置文件
```

## 页面说明

### 首页 (index)

- 用户输入出生年、月、日、时信息
- 选择分析偏好（事业运势、感情运势、财运分析或综合分析）
- 点击"开始推理"按钮进行分析

### 结果页 (result)

- 显示分析结果，包括多个分析部分（每部分有标题和内容）
- 提供分享功能
- 提供返回首页按钮

### 我的页面 (my)

- 用户信息展示（头像和昵称）
- 菜单选项：历史记录、关于我们、联系客服
- 版本信息展示

## API接口

### CEZE大模型API

- 接口地址：`https://api.ceze.com/v1/fortune-analysis`
- 请求方式：POST
- 请求参数：
  ```json
  {
    "birth_time": {
      "year": 1990,
      "month": 1,
      "day": 1,
      "hour": 0
    },
    "preference": "综合分析"
  }
  ```
- 返回格式：JSON

## 开发与部署

### 开发环境

- 微信开发者工具
- Node.js v12.0+

### 部署步骤

1. 在微信公众平台注册小程序账号
2. 创建云开发环境
3. 上传代码并提交审核
4. 发布小程序

## 注意事项

- 本应用仅供娱乐参考，请勿过分依赖分析结果
- 需要在app.js中配置正确的云开发环境ID
- 需要在API调用处配置正确的API密钥

## 未来计划

- 添加更多分析维度
- 优化用户界面和体验
- 增加历史记录功能
- 支持多语言
#   -  
 