import { Header } from '@/components/header'
import { MaintenancePerformanceGrid } from '@/components/table-performance'

export default function PerformancePage() {
  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main className="flex-1 overflow-hidden">
        <MaintenancePerformanceGrid />
      </main>
    </div>
  )
}
