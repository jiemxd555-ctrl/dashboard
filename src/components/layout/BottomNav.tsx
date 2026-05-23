import React from 'react'
import { LayoutDashboard, Columns3, Tag, Clock, BookOpen } from 'lucide-react'
import { ViewType } from '../../types'

interface BottomNavProps {
  current: ViewType
  onChange: (v: ViewType) => void
}

const NAV: { id: ViewType; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: '今日', icon: <LayoutDashboard size={20} /> },
  { id: 'kanban',    label: '看板', icon: <Columns3 size={20} /> },
  { id: 'domain',    label: '领域', icon: <Tag size={20} /> },
  { id: 'timeline',  label: '时间', icon: <Clock size={20} /> },
  { id: 'review',    label: '复盘', icon: <BookOpen size={20} /> },
]

export function BottomNav({ current, onChange }: BottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-stone-100 flex z-40"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {NAV.map(item => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors ${
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
