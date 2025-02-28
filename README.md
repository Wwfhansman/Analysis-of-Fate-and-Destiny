# 命理分析小程序

作者：Kris
这是一款基于微信小程序平台开发的命理分析工具，旨在为用户提供便捷的命理分析服务。

## 项目概述

命理分析小程序是一款基于微信小程序平台开发的应用，通过用户输入的出生年、月、日、时信息，调用CEZE大模型API进行命理分析，并提供相关的运势解读。

## 主要功能

- **命理分析**: 用户可输入出生年月日，获取个人命理分析结果
- **历史记录**: 查看历史分析记录
- **理论知识**: 提供命理相关的理论知识解读
- **个人中心**: 管理个人信息和使用记录

## 功能特点

- **命理分析**：根据用户出生信息进行命理分析
- **多维度解读**：提供事业、感情、财运、健康等多个维度的分析
- **个性化推理**：支持用户选择不同的推理偏好
- **结果分享**：支持将分析结果分享给好友
- **用户中心**：提供用户信息管理、历史记录查询等功能

## 技术特点

- 采用微信小程序原生开发框架
- 使用自定义导航栏组件
- 优雅的用户界面设计
- 响应式布局，适配各种屏幕尺寸
- 微信云开发（CloudBase）
- CEZE大模型API接口

## 项目结构

```
ml/
├── app.js                 // 应用程序入口文件
├── app.json               // 应用程序配置文件
├── app.wxss               // 应用程序全局样式
├── components/            // 自定义组件
├── images/                // 图片资源
├── pages/                 // 页面文件
│   ├── index/             // 首页（输入信息页）
│   ├── result/            // 结果页
│   ├── history/           // 历史记录页
│   ├── theory/            // 理论知识页
│   └── my/                // 我的页面
└── project.config.json    // 项目配置文件
```

## 页面说明

### 首页

用户输入出生年月日，点击“开始推理”按钮进行分析

### 结果页

显示分析结果，包括多个分析维度

### 历史记录页

查看历史分析记录

### 理论知识页

提供命理相关知识

### 我的页面

用户信息展示

## API接口

### CEZE大模型API

提供命理分析服务

## 开发与部署

### 开发环境

微信开发者工具

### 部署步骤

1. 在微信公众平台注册小程序账号
2. 创建云开发环境
3. 上传代码并提交审核
4. 发布小程序

## 未来计划

- 添加更多分析维度
- 优化用户界面和体验
- 增加历史记录功能
- 支持多语言