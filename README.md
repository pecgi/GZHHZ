# 📖 每日阅读汇总

一个基于 GitHub Issues + Jekyll 的微信公众号文章收藏阅读站，完全免费部署在 GitHub Pages 上。

## ✨ 特点

- 🆓 **完全免费** - 使用 GitHub Pages 托管，零成本
- 📝 **简单添加** - 通过 GitHub Issue 添加文章，像写便签一样简单
- 🌙 **深色模式** - 支持浅色/深色主题切换
- 📱 **响应式设计** - 手机、平板、电脑都能完美阅读
- 🏷️ **标签分类** - 自动按日期和标签组织文章
- 🔍 **全文搜索** - 支持搜索已收藏的文章（可选配置）

## 🚀 快速开始

### 1. Fork 本仓库

本模板适用于仓库名为 **GZHHZ** 的项目。

### 2. 启用 GitHub Pages

1. 进入你 Fork 后的仓库
2. 点击 **Settings** → **Pages**
3. **Source** 选择 "GitHub Actions"

### 3. 添加第一篇文章

1. 点击仓库顶部的 **Issues** 标签
2. 点击绿色 **New issue** 按钮
3. 选择 "添加文章" 模板
4. 填写文章链接、公众号名称等信息
5. 点击 **Submit new issue**

### 4. 等待构建完成

- 提交 Issue 后，GitHub Actions 会自动运行（约1-2分钟）
- 构建完成后，你的阅读站就可以访问了
- 地址：`https://你的用户名.github.io/GZHHZ/`

## 📝 添加文章的方法

### 方法一：GitHub Issue（推荐）

1. 打开仓库的 Issues 页面
2. 点击 "New issue"
3. 选择 "添加文章" 模板
4. 填写文章链接、公众号、标签等信息
5. 提交后自动抓取并生成页面

### 方法二：手动创建文章文件

在 `_posts` 目录下创建 Markdown 文件，文件名格式：`YYYY-MM-DD-标题.md`

```yaml
---
layout: post
title: "文章标题"
date: 2024-01-15 10:30:00 +0800
source: "公众号名称"
author: "作者名"
tags: [标签1, 标签2]
original_url: "https://mp.weixin.qq.com/s/xxxxx"
---

文章内容（支持 Markdown 格式）
```

## 📁 项目结构

```
.
├── .github/
│   ├── workflows/
│   │   └── build.yml      # GitHub Actions 自动构建
│   └── ISSUE_TEMPLATE/
│       └── add-article.md # Issue 模板
├── _data/
│   └── articles.json      # 从 Issues 抓取的文章数据
├── _includes/             # Jekyll 包含文件
├── _layouts/              # Jekyll 布局模板
│   ├── default.html       # 默认布局
│   └── post.html          # 文章页布局
├── _posts/                # 文章目录
├── assets/
│   └── css/
│       └── style.css      # 网站样式
├── scripts/
│   └── fetch-articles.js  # 文章抓取脚本
├── _config.yml            # Jekyll 配置
├── Gemfile                # Ruby 依赖
├── index.html             # 首页
└── README.md              # 本文件
```

## 🎨 自定义配置

编辑 `_config.yml` 文件：

```yaml
title: 你的网站标题
description: 网站描述
author: 你的名字
```

## 🔧 本地开发（可选）

如果你想在本地预览或修改主题：

### 安装依赖

```bash
# 安装 Ruby 依赖
bundle install

# 安装 Node.js 依赖
npm install
```

### 本地运行

```bash
bundle exec jekyll serve
```

访问 `http://localhost:4000`

## ❓ 常见问题

### Q: 文章抓取失败怎么办？

A: 检查以下几点：
1. 文章链接是否正确（应该是微信公众号文章链接）
2. 链接是否包含 `https://mp.weixin.qq.com/s/`
3. 该文章是否已被删除或设为私密

### Q: 如何修改已发布的文章？

A: 编辑对应的 GitHub Issue，修改后会自动重新构建。

### Q: 构建失败了怎么办？

A: 进入仓库的 **Actions** 标签，查看构建日志，根据错误信息排查问题。

### Q: 可以使用自定义域名吗？

A: 可以！在仓库的 **Settings** → **Pages** 中配置 Custom domain。

## 📝 技术栈

- **静态网站生成器**: [Jekyll](https://jekyllrb.com/)
- **托管**: [GitHub Pages](https://pages.github.com/)
- **自动化**: [GitHub Actions](https://github.com/features/actions)
- **数据存储**: [GitHub Issues](https://docs.github.com/en/issues)

## 📄 许可证

MIT License - 随意使用和修改

## 💖 感谢

如果你喜欢这个项目，请给它一个 Star ⭐
