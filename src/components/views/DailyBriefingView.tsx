import React from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Newspaper } from 'lucide-react'
import { Task } from '../../types'

interface DailyBriefingViewProps {
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onMarkDone: (id: string) => void
  onAddTask: () => void
}

export function DailyBriefingView(_: DailyBriefingViewProps) {
  const today = format(new Date(), 'M月d日 EEEE', { locale: zhCN })

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <div className="mb-5 md:mb-8">
        <div className="text-xs md:text-sm text-stone-400">{today}</div>
        <h1 className="text-lg md:text-2xl font-semibold md:font-light text-stone-800 mt-0.5">每日私人简报</h1>
      </div>

      <section className="bg-white rounded-3xl border border-stone-100 min-h-[360px] md:min-h-[440px] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-4">
            <Newspaper size={20} />
          </div>
          <p className="text-sm md:text-base text-stone-500 leading-relaxed">
            这里先留空，等你把每日私人简报的内容整理好后，我们再按你的结构填进来。
          </p>
        </div>
      </section>
    </div>
  )
}
