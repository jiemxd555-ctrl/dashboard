# 个人事务驾驶舱

一个高级、克制的本地个人任务管理 Web App。数据保存在浏览器 `localStorage`，无需后端，刷新不丢失。

---

## 快速启动

### 环境要求

- Node.js 18+（已内置于当前环境，路径见下方）

### 安装依赖

```bash
cd /Users/a/dashboard
npm install
```

> 当前环境中 npm 不在标准 PATH，使用以下方式运行：
>
> ```bash
> NODE="/Users/a/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
> export PATH="$(dirname $NODE):$PATH"
> $NODE node_modules/.bin/npm-cli.js install  # 已安装则跳过
> $NODE node_modules/.bin/vite               # 启动开发服务器
> ```

### 启动开发服务器

```bash
npm run dev
# 访问 http://localhost:5173
```

### 生产构建

```bash
npm run build
npm run preview   # 本地预览构建产物
```

---

## 功能模块

| 模块 | 说明 |
|------|------|
| 今日驾驶舱 | 今日最重要 3 件事、逾期任务、本周高优先级、压力指数总览 |
| 任务看板 | 收集箱 / 未开始 / 进行中 / 等待中 / 已完成 / 暂停，支持拖拽 |
| 领域视图 | 工作 / 学习成长 / 财务 / 生活 / 副业，精力分布可视化 |
| 时间视图 | 今天 / 本周 / 本月 / 未来 / 无截止日期 |
| 压力视图 | 0-10 压力指数 + 自动减压建议 |
| 复盘中心 | 日 / 周复盘，结构化问题引导 |

---

## 优先级计算规则

```
priorityScore = 重要性 × 3 + 紧急性 × 2 + 长期价值 × 2 − 执行难度

≥ 20 → 极高（红色）
15-19 → 高（橙色）
10-14 → 中（黄色）
< 10  → 低（灰色）
```

---

## 压力指数算法

系统根据以下因素自动计算 0-10 分压力指数：

- 进行中任务数量
- 已逾期任务数量
- 高优先级任务数量（重要性 ≥ 4 且紧急性 ≥ 4）
- 本周预计总耗时
- 高耗能任务数量
- 等待反馈任务数量

| 分值 | 状态 |
|------|------|
| 0-3 | 轻松 |
| 4-6 | 正常 |
| 7-8 | 偏高（显示警告） |
| 9-10 | 过载（强烈提醒） |

---

## 数据备份与迁移

### 导出
点击侧边栏底部「导出备份」，下载 `.json` 文件。

### 导入
点击「导入 JSON」，选择之前导出的备份文件即可恢复所有任务和复盘。

**JSON 格式：**
```json
{
  "tasks": [...],
  "reviews": [...],
  "exportedAt": "2026-05-22T..."
}
```

---

## 任务数据结构

```typescript
interface Task {
  id: string
  title: string
  area: 'work' | 'learning' | 'finance' | 'life' | 'side'
  status: 'inbox' | 'todo' | 'in_progress' | 'waiting' | 'done' | 'paused'
  importance: number        // 1-5
  urgency: number           // 1-5
  longTermValue: number     // 1-5
  difficulty: number        // 1-5
  energy: 'low' | 'medium' | 'high'
  deadline?: string         // YYYY-MM-DD
  estimatedMinutes?: number
  blocker?: string
  tags: string[]
  notes?: string
  nextAction?: string
  createdAt: string
  updatedAt: string
}
```

---

## 项目结构

```
src/
├── components/
│   ├── layout/
│   │   └── Sidebar.tsx          # 导航侧边栏
│   ├── ui/
│   │   ├── Badge.tsx            # 标签组件
│   │   └── Modal.tsx            # 弹窗组件
│   ├── task/
│   │   ├── TaskCard.tsx         # 任务卡片
│   │   ├── TaskForm.tsx         # 新增/编辑表单
│   │   └── TaskDetailModal.tsx  # 任务详情弹窗
│   └── views/
│       ├── DashboardView.tsx    # 今日驾驶舱
│       ├── KanbanView.tsx       # 任务看板
│       ├── DomainView.tsx       # 领域视图
│       ├── TimelineView.tsx     # 时间视图
│       ├── StressView.tsx       # 压力视图
│       └── ReviewView.tsx       # 复盘中心
├── hooks/
│   └── useTasks.ts              # 数据状态 + localStorage
├── types/
│   └── index.ts                 # 所有类型定义
├── utils/
│   ├── taskUtils.ts             # 工具函数 + 压力算法
│   └── sampleData.ts            # 示例数据（20 条任务）
├── App.tsx
└── main.tsx
```

---

## 后续扩展方向

- **提醒功能**：用 Web Notifications API 实现截止日期提醒
- **重复任务**：支持每日 / 每周周期性任务
- **甘特图视图**：可视化任务时间线
- **多人协作**：接入 Supabase 或 Firebase 实现云同步
- **移动端 PWA**：添加 manifest + service worker 支持离线访问
- **数据统计**：完成率、领域分布趋势图
