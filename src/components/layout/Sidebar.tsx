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
} from 'lucide-react'
import { ViewType } from '../../types'

interface SidebarProps {
  current: ViewType
  onChange: (v: ViewType) => void
  onExport: () => void
  onImport: () => void
}

const NAV_ITEMS: { id: ViewType; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: '今日驾驶舱', icon: <LayoutDashboard size={16} /> },
  { id: 'kanban', label: '任务看板', icon: <Columns3 size={16} /> },
  { id: 'domain', label: '领域视图', icon: <Tag size={16} /> },
  { id: 'timeline', label: '时间视图', icon: <Clock size={16} /> },
  { id: 'stress', label: '压力视图', icon: <Activity size={16} /> },
  { id: 'review', label: '复盘中心', icon: <BookOpen size={16} /> },
]

export function Sidebar({ current, onChange, onExport, onImport }: SidebarProps) {
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
