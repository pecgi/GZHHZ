/**
 * 从 GitHub Issues 抓取文章信息并生成 Jekyll 文章
 * 
 * 工作流程：
 * 1. 读取仓库的所有 Issues（带 article 标签的）
 * 2. 解析 Issue 内容，提取文章链接、公众号等信息
 * 3. 尝试抓取文章内容（简化版，实际使用可能需要更复杂的逻辑）
 * 4. 生成 Jekyll Markdown 文件到 _posts 目录
 */

const fs = require('fs');
const path = require('path');
const { Octokit } = require('@octokit/rest');

// 配置
const POSTS_DIR = path.join(__dirname, '..', '_posts');
const DATA_DIR = path.join(__dirname, '..', '_data');

// 确保目录存在
if (!fs.existsSync(POSTS_DIR)) {
  fs.mkdirSync(POSTS_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 解析 Issue 内容
function parseIssueBody(body) {
  const result = {
    url: '',
    source: '',
    author: '',
    tags: [],
    note: ''
  };

  if (!body) return result;

  // 提取链接
  const urlMatch = body.match(/原文链接[：:]\s*(https?:\/\/[^\s\n]+)/i) ||
                   body.match(/(https?:\/\/mp\.weixin\.qq\.com\/s\/[^\s\n]+)/);
  if (urlMatch) {
    result.url = urlMatch[1].trim();
  }

  // 提取公众号名称
  const sourceMatch = body.match(/公众号名称[：:]\s*([^\n]+)/i);
  if (sourceMatch) {
    result.source = sourceMatch[1].trim();
  }

  // 提取作者
  const authorMatch = body.match(/作者[：:]\s*([^\n]+)/i);
  if (authorMatch) {
    result.author = authorMatch[1].trim();
  }

  // 提取标签
  const tagsMatch = body.match(/标签[：:]\s*([^\n]+)/i);
  if (tagsMatch) {
    result.tags = tagsMatch[1]
      .split(/[,，]/)
      .map(t => t.trim())
      .filter(t => t);
  }

  // 提取备注
  const noteMatch = body.match(/备注[：:]\s*([^\n]+)/i);
  if (noteMatch) {
    result.note = noteMatch[1].trim();
  }

  return result;
}

// 生成文件名（安全的文件名）
function generateFilename(date, title) {
  const dateStr = date.toISOString().split('T')[0];
  // 简化标题，移除特殊字符
  const safeTitle = title
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  return `${dateStr}-${safeTitle || 'untitled'}.md`;
}

// 转义 YAML 字符串
function escapeYaml(str) {
  if (!str) return '';
  if (/[:#\[\]{}|>&*!,'"%@`]/.test(str)) {
    return `"${str.replace(/"/g, '\\"')}"`;
  }
  return str;
}

// 主函数
async function main() {
  try {
    console.log('🚀 开始抓取文章...');

    // 初始化 Octokit
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/');
    
    if (!owner || !repo) {
      console.error('❌ 无法获取仓库信息');
      process.exit(1);
    }

    console.log(`📦 仓库: ${owner}/${repo}`);

    // 获取所有带 article 标签的 Issues
    const { data: issues } = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      labels: 'article',
      state: 'all',
      per_page: 100
    });

    console.log(`📋 找到 ${issues.length} 篇文章`);

    const articles = [];

    for (const issue of issues) {
      console.log(`\n📝 处理: ${issue.title}`);

      const parsed = parseIssueBody(issue.body);
      
      if (!parsed.url) {
        console.log(`⚠️ 跳过: 没有找到文章链接`);
        continue;
      }

      // 从标题中提取文章名（去掉前缀）
      let title = issue.title
        .replace(/^\[文章\]\s*/i, '')
        .replace(/^article[\s:]*/i, '')
        .trim();

      // 如果没有标题，使用 URL 的一部分
      if (!title || title === '[文章]') {
        title = `文章-${issue.number}`;
      }

      const articleDate = new Date(issue.created_at);
      const filename = generateFilename(articleDate, title);
      const filepath = path.join(POSTS_DIR, filename);

      // 检查文件是否已存在且未修改
      if (fs.existsSync(filepath)) {
        const existingContent = fs.readFileSync(filepath, 'utf-8');
        const existingIssueMatch = existingContent.match(/issue_number:\s*(\d+)/);
        if (existingIssueMatch && existingIssueMatch[1] === String(issue.number)) {
          // 检查 Issue 是否被编辑过
          const existingUpdatedMatch = existingContent.match(/issue_updated_at:\s*"([^"]+)"/);
          if (existingUpdatedMatch && existingUpdatedMatch[1] === issue.updated_at) {
            console.log(`⏭️ 跳过: 文件未变更`);
            articles.push({
              title,
              filename,
              date: articleDate.toISOString(),
              source: parsed.source,
              tags: parsed.tags
            });
            continue;
          }
        }
      }

      // 生成文章 front matter
      const frontMatter = `---
layout: post
title: ${escapeYaml(title)}
date: ${articleDate.toISOString()}
issue_number: ${issue.number}
issue_updated_at: "${issue.updated_at}"
source: ${escapeYaml(parsed.source)}
author: ${escapeYaml(parsed.author)}
tags: [${parsed.tags.map(t => `"${escapeYaml(t)}"`).join(', ')}]
original_url: "${parsed.url}"
---

{% comment %}
文章来源: ${parsed.url}
公众号: ${parsed.source || '未知'}
作者: ${parsed.author || '未知'}
{% endcomment %}

> 📎 **原文链接**: [${title}](${parsed.url})
> 
> 🏷️ **公众号**: ${parsed.source || '未知'}
${parsed.author ? `> 👤 **作者**: ${parsed.author}` : ''}
${parsed.note ? `> 📝 **备注**: ${parsed.note}` : ''}

---

*本文章由系统自动从 GitHub Issue 导入*

<!-- 
注意：由于微信公众号的反爬机制，这里只显示链接和基本信息。
如果你想保存完整文章内容，可以：
1. 手动复制文章内容粘贴到此处
2. 使用浏览器插件配合自动抓取
-->
`;

      // 写入文件
      fs.writeFileSync(filepath, frontMatter, 'utf-8');
      console.log(`✅ 已保存: ${filename}`);

      articles.push({
        title,
        filename,
        date: articleDate.toISOString(),
        source: parsed.source,
        tags: parsed.tags
      });
    }

    // 保存文章索引
    const articlesData = {
      generated_at: new Date().toISOString(),
      count: articles.length,
      articles: articles.sort((a, b) => new Date(b.date) - new Date(a.date))
    };
    fs.writeFileSync(
      path.join(DATA_DIR, 'articles.json'),
      JSON.stringify(articlesData, null, 2),
      'utf-8'
    );

    console.log(`\n✨ 完成！共处理 ${articles.length} 篇文章`);

  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = { parseIssueBody, generateFilename };
