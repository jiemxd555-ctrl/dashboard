import React from 'react'
import {
  LayoutDashboard,
  Columns3,
  Tag,
  Clock,
  Activity,
  BookOpen,
  Upload,
  Download,
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Camera,
} from 'lucide-react'
import { ViewType } from '../../types'
import { SyncStatus } from '../../hooks/useTasks'

interface SidebarProps {
  current: ViewType
  onChange: (v: ViewType) => void
  onExport: () => void
  onImport: () => void
  syncStatus: SyncStatus
  onSync: () => void
}

const NAV_ITEMS: { id: ViewType; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: '今日驾驶舱', icon: <LayoutDashboard size={16} /> },
  { id: 'eno', label: 'ENO 摄影部', icon: <Camera size={16} /> },
  { id: 'kanban', label: '任务看板', icon: <Columns3 size={16} /> },
  { id: 'domain', label: '领域视图', icon: <Tag size={16} /> },
  { id: 'timeline', label: '时间视图', icon: <Clock size={16} /> },
  { id: 'stress', label: '压力视图', icon: <Activity size={16} /> },
]

function SyncIndicator({ status, onSync }: { status: SyncStatus; onSync: () => void }) {
  const visual = (() => {
    switch (status) {
      case 'syncing':
        return { icon: <RefreshCw size={12} className="animate-spin" />, text: '同步中...', color: 'text-stone-400' }
      case 'synced':
        return { icon: <CheckCircle2 size={12} />, text: '已同步', color: 'text-emerald-500' }
      case 'offline':
        return { icon: <CloudOff size={12} />, text: '离线', color: 'text-stone-400' }
      case 'error':
        return { icon: <AlertTriangle size={12} />, text: '同步失败', color: 'text-amber-500' }
      default:
        return { icon: <Cloud size={12} />, text: '云端同步', color: 'text-stone-400' }
    }
  })()

  return (
    <button
      onClick={onSync}
      title="点击立即从云端拉取最新数据"
      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${visual.color} hover:bg-stone-100 transition-colors`}
    >
      {visual.icon}
      <span>{visual.text}</span>
    </button>
  )
}

export function Sidebar({ current, onChange, onExport, onImport, syncStatus, onSync }: SidebarProps) {
  return (
    <aside className="hidden md:flex w-56 flex-shrink-0 h-screen bg-stone-50 border-r border-stone-100 flex-col sticky top-0">
      {/* Logo */}
      <div className="px-5 pt-7 pb-6">
        <div className="text-sm font-semibold text-stone-800 tracking-wide">事务驾驶舱</div>
        <div className="text-xs text-stone-400 mt-0.5">Personal Dashboard</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
              current === item.id
                ? 'bg-stone-900 text-white font-medium'
                : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer actions */}
      <div className="px-3 py-4 border-t border-stone-100 space-y-0.5">
        <SyncIndicator status={syncStatus} onSync={onSync} />
        <button
          onClick={onImport}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <Upload size={14} /> 导入 JSON
        </button>
        <button
          onClick={onExport}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <Download size={14} /> 导出备份
        </button>
      </div>
    </aside>
  )
}
