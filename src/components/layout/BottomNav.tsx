import React from 'react'
import { LayoutDashboard, Newspaper, Columns3, Tag, Clock, Camera } from 'lucide-react'
import { ViewType } from '../../types'

interface BottomNavProps {
  current: ViewType
  onChange: (v: ViewType) => void
}

const NAV: { id: ViewType; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: '今日', icon: <LayoutDashboard size={20} /> },
  { id: 'briefing',  label: '简报', icon: <Newspaper size={20} /> },
  { id: 'eno',       label: '摄影部', icon: <Camera size={20} /> },
  { id: 'kanban',    label: '看板', icon: <Columns3 size={20} /> },
  { id: 'domain',    label: '领域', icon: <Tag size={20} /> },
  { id: 'timeline',  label: '时间', icon: <Clock size={20} /> },
]

export function BottomNav({ current, onChange }: BottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-stone-100 flex z-40"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {NAV.map(item => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`relative flex-1 min-w-0 flex flex-col items-center justify-center py-2 gap-1 transition-colors ${
            current === item.id ? 'text-stone-900' : 'text-stone-400'
          }`}
        >
          {item.icon}
          <span className="text-[10px] font-medium">{item.label}</span>
          {current === item.id && (
            <span className="absolute bottom-0 w-6 h-0.5 bg-stone-900 rounded-full" style={{ marginBottom: 'env(safe-area-inset-bottom)' }} />
          )}
        </button>
      ))}
    </nav>
  )
}
