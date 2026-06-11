# 事务驾驶舱 · 项目说明

> 给 AI 助手看的项目文档。读完这个文件就能上手修改。

---

## 项目概览

个人任务管理看板，部署在 https://jie-board.com  
单用户使用，无登录系统。

**技术栈**
- 前端：React 19 + TypeScript + Vite
- 样式：Tailwind CSS
- 图标：lucide-react
- 日期：date-fns
- 部署：Vercel（GitHub 推送自动触发）
- 云存储：Upstash Redis（单个 JSON blob）

---

## 目录结构

```
/
├── api/
│   └── sync.ts              # Vercel Serverless Function，唯一后端接口
├── src/
│   ├── App.tsx              # 根组件，路由视图切换
│   ├── types/
│   │   └── index.ts         # 所有类型定义（Task、ENOMember 等）
│   ├── hooks/
│   │   └── useTasks.ts      # 核心 hook：数据状态 + 云同步逻辑
│   ├── utils/
│   │   ├── taskUtils.ts     # 工具函数（排序、压力计算等）
│   │   ├── sampleData.ts    # 示例任务数据（首次加载时使用）
│   │   └── enoData.ts       # ENO 摄影部默认数据
│   └── components/
│       ├── layout/
│       │   ├── Sidebar.tsx  # 桌面端侧边栏导航
│       │   └── BottomNav.tsx # 手机端底部导航
│       ├── views/
│       │   ├── DashboardView.tsx  # 今日驾驶舱
│       │   ├── DailyBriefingView.tsx # 每日私人简报
│       │   ├── KanbanView.tsx     # 任务看板
│       │   ├── DomainView.tsx     # 领域视图
│       │   ├── ENOView.tsx        # ENO 摄影部
│       │   ├── TimelineView.tsx   # 时间视图
│       │   └── StressView.tsx     # 压力视图
│       ├── task/
│       │   ├── TaskCard.tsx       # 任务卡片
│       │   ├── TaskForm.tsx       # 新增/编辑任务表单
│       │   └── TaskDetailModal.tsx # 任务详情弹窗
│       └── ui/
│           └── Modal.tsx
```

---

## 核心数据结构

### Task（任务）

```typescript
interface Task {
  id: string
  title: string
  area: 'work' | 'learning' | 'finance' | 'life'
  status: 'inbox' | 'idea' | 'todo' | 'in_progress' | 'waiting' | 'done' | 'paused'
  importance: number      // 1-5
  urgency: number         // 1-5
  longTermValue: number   // 1-5
  difficulty: number      // 1-5
  energy: 'low' | 'medium' | 'high'
  deadline?: string       // 'YYYY-MM-DD'
  estimatedMinutes?: number
  blocker?: string
  tags: string[]
  notes?: string
  nextAction?: string
  createdAt: string       // ISO 8601
  updatedAt: string       // ISO 8601
}
```

### ENOMember（ENO 摄影部成员）

```typescript
interface ENOMember {
  id: string
  name: string
  role: string
  metric: string          // 日均指标描述
  sections: ENOSection[]
}

interface ENOSection {
  tag: string             // '每日' | '每周' | '每月' | '不定期' 等
  items: ENOTaskItem[]
}

interface ENOTaskItem {
  name: string
  qty: string
  primary?: boolean       // 是否为重点任务
}
```

---

## 视图路由

`ViewType = 'dashboard' | 'briefing' | 'eno' | 'kanban' | 'domain' | 'timeline' | 'stress'`

在 `App.tsx` 中通过 `view` state 切换，Sidebar 和 BottomNav 触发 `setView`。

---

## 云同步机制

### 存储

- **本地**：localStorage（3个 key）
  - `dashboard_tasks` — 任务数组 JSON
  - `dashboard_eno_team` — ENO 团队数据 JSON
  - `dashboard_saved_at` — 上次成功同步的时间戳（用于多设备冲突判断）
- **云端**：Upstash Redis，单个 key `dashboard:user-data`

### 同步流程

```
本地数据变更
  → 立即写入 localStorage
  → 1500ms 防抖后 POST /api/sync（推送到云端）
  → 成功：更新 dashboard_saved_at
  → 失败：显示「点击重试」，自动重试最多 3 次（间隔 10 秒）

页面初次加载
  → GET /api/sync 拉取云端数据
  → 比较 savedAt 时间戳：云端更新则用云端，本地更新则推本地

手动点击同步图标
  → 状态为「失败」时：推送本地数据（保护本地修改）
  → 其他状态：拉取云端最新数据
```

### ⚠️ 最重要的约定

**后端 `/api/sync.ts` 的 POST 校验字段必须和前端 payload 保持一致。**

当前前端推送的 payload 结构：
```json
{
  "tasks": [...],
  "enoTeam": [...],
  "enoOverview": [...],
  "savedAt": "2024-01-01T00:00:00.000Z"
}
```

后端只校验 `tasks`（数组）和 `savedAt`（字符串）是否存在。  
**删除任何功能时，前后端必须同步修改，否则后端返回 400，所有同步失败。**  
这是历史上最大的坑。

---

## 每日私人简报同步

- 网站中的「每日私人简报」页面对应：
  - `src/components/views/DailyBriefingView.tsx`
- 日报来源不是任务数据，而是本机自动生成的 HTML 文件。
- 日报读取入口统一使用：
  - `/Users/a/Desktop/daily`
- 这个路径可能是软链接，目标目录未来可能调整；同步脚本不要写死真实落盘目录，优先跟随这个桌面入口。

### 同步方式

- 网站新增独立接口：
  - `api/briefing.ts`
- Redis 独立 key：
  - `dashboard:daily-briefing`
- 只保留 **当天最新一份** HTML，不做历史归档。
- 前端展示方式：
  - `DailyBriefingView.tsx` 使用 `iframe srcDoc` 原样展示 HTML，尽量保留日报自己的排版、字体、分隔线和移动端样式。

### 本地上传脚本

- Node 脚本：
  - `scripts/sync-daily-briefing.mjs`
- Shell 包装：
  - `scripts/sync-daily-briefing.sh`
- 默认行为：
  - 从 `/Users/a/Desktop/daily` 里寻找当天 `YYYY-MM-DD.html` 或 `YYYY-MM-DD-v2.html` 等版本文件
  - 选最近修改的一份
  - POST 到 `https://jie-board.com/api/briefing`

### 可选环境变量

```bash
BRIEFING_SOURCE_DIR=/Users/a/Desktop/daily
BRIEFING_SYNC_URL=https://jie-board.com/api/briefing
BRIEFING_SYNC_TOKEN=
BRIEFING_DATE=2026-06-10
```

- `BRIEFING_SYNC_TOKEN` 仅在服务端和本地同时配置时启用校验。
- 如果 Vercel 没配 `BRIEFING_SYNC_TOKEN`，接口默认允许上传，优先保证链路先跑通。

### 风险提醒

- 不要把每日简报内容塞进现有 `api/sync.ts` 的任务同步 payload。
- 原因：任务同步和日报同步是两条不同的数据链路，绑在一起后很容易重演之前“删字段导致整站同步失败”的坑。

---

## 环境变量（Vercel 配置）

```
KV_REST_API_URL=    # Upstash Redis REST URL
KV_REST_API_TOKEN=  # Upstash Redis Token
```

---

## 部署流程

1. 修改代码
2. `git add . && git commit -m "描述"`
3. `git push origin main`
4. Vercel 自动检测推送并重新部署（约 1 分钟）
5. 访问 https://jie-board.com 验证

**注意**：如果部署后线上没更新，大概率是有文件存在 TypeScript 报错导致构建失败，Vercel 回退到上一个成功版本。先确保本地零 TS 报错。

---

## 曾经踩过的坑

| 坑 | 原因 | 解法 |
|---|---|---|
| 线上一直显示旧版本 | 遗留的旧组件文件（如 ReviewView.tsx）引用了已删除的类型，TS 编译报错 | 删功能时把相关文件也一起删干净 |
| 同步后数据消失 | 后端还在校验已删除的字段（`reviews`），前端不发这个字段，每次推送被 400 拒绝 | 前后端同步修改 |
| 新设备打开初始化了示例数据 | 示例数据的 `updatedAt` 是当前时间，比云端时间戳新，触发了推送覆盖云端 | 用 `dashboard_saved_at` 标记判断是否有同步历史 |
| 手动点同步反而丢了刚改的内容 | 同步按钮触发 pull（拉云端），覆盖了本地未推送的修改 | 失败状态下点击改为 push（推本地） |

---

## UI 约定

- 配色风格：暖石色系（`stone-*`），强调色金色 `#9B7E50`
- 圆角：`rounded-xl` / `rounded-2xl`
- 移动端：底部 `BottomNav`，桌面端：左侧 `Sidebar`（`hidden md:flex`）
- 响应式断点：`md:` = 桌面，无前缀 = 手机
- ENO 页面使用独立的暖米色配色体系（`#FAF8F5`、`#EAE6DE`、`#9B7E50`）
