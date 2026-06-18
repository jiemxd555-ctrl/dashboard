import React, { useState, useRef } from 'react'
import { Sidebar } from './components/layout/Sidebar'
import { BottomNav } from './components/layout/BottomNav'
import { DashboardView } from './components/views/DashboardView'
import { DailyBriefingView } from './components/views/DailyBriefingView'
import { KanbanView } from './components/views/KanbanView'
import { DomainView } from './components/views/DomainView'
import { ENOView } from './components/views/ENOView'
import { TimelineView } from './components/views/TimelineView'
import { StressView } from './components/views/StressView'
import { Modal } from './components/ui/Modal'
import { TaskForm } from './components/task/TaskForm'
import { TaskDetailModal } from './components/task/TaskDetailModal'
import { useTasks } from './hooks/useTasks'
import { Task, ViewType, TaskStatus } from './types'

export default function App() {
  const {
    tasks, enoTeam, enoOverview, syncStatus,
    addTask, updateTask, deleteTask, markDone,
    importTasks, exportData,
    updateENOTeam, updateENOOverview,
    pushNow,
    pullNow,
  } = useTasks()

  const [view, setView] = useState<ViewType>('dashboard')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImport = () => fileInputRef.current?.click()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target?.result as string)
        importTasks(data)
        alert('导入成功！')
      } catch {
        alert('JSON 格式不正确，导入失败')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleUpdateStatus = (id: string, status: TaskStatus) => {
    updateTask(id, { status })
  }

  const commonProps = {
    tasks,
    onTaskClick: (task: Task) => setSelectedTask(task),
    onMarkDone: (id: string) => markDone(id),
    onAddTask: () => setAddModalOpen(true),
  }

  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return <DashboardView {...commonProps} />
      case 'briefing':
        return <DailyBriefingView {...commonProps} />
      case 'kanban':
        return (
          <KanbanView
            {...commonProps}
            onUpdateStatus={handleUpdateStatus}
          />
        )
      case 'domain':
        return <DomainView {...commonProps} />
      case 'eno':
        return <ENOView enoTeam={enoTeam} onUpdateENOTeam={updateENOTeam} enoOverview={enoOverview} onUpdateENOOverview={updateENOOverview} />
      case 'timeline':
        return <TimelineView {...commonProps} />
      case 'stress':
        return (
          <StressView
            tasks={tasks}
            onTaskClick={commonProps.onTaskClick}
            onMarkDone={commonProps.onMarkDone}
          />
        )
      default:
        return <DashboardView {...commonProps} />
    }
  }

  return (
    <div className="flex min-h-screen bg-stone-50 text-stone-900">
      <Sidebar
        current={view}
        onChange={setView}
        onExport={exportData}
        onImport={handleImport}
        syncStatus={syncStatus}
        onSync={syncStatus === 'error' ? pushNow : pullNow}
      />

      {/* Main content — on mobile adds bottom padding for nav bar */}
      <main className="flex-1 min-w-0 pb-20 md:pb-0 md:min-h-screen">
        <div key={view} className="min-h-full">
          {renderView()}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav current={view} onChange={setView} />

      {/* Add task modal */}
      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="新增任务" wide>
        <TaskForm
          onSubmit={data => { addTask(data); setAddModalOpen(false) }}
          onCancel={() => setAddModalOpen(false)}
          submitLabel="创建任务"
        />
      </Modal>

      {/* Task detail modal */}
      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={(id, data) => { updateTask(id, data as Partial<Task>); setSelectedTask(null) }}
        onDelete={id => { deleteTask(id); setSelectedTask(null) }}
        onMarkDone={id => { markDone(id); setSelectedTask(null) }}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
