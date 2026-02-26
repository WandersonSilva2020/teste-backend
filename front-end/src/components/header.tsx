'use client'

import { Button } from './ui/button'
import { FileSpreadsheet } from 'lucide-react'

export function Header() {
  const handleExportExcel = () => {
    // Funcionalidade de exportação para Excel
    alert('Exportar para Excel')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-8 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
        <h1 className="text-2xl font-bold text-gray-900">Performance Manutenção</h1>
      </div>
      <Button
        onClick={handleExportExcel}
        variant="outline"
        className="gap-2 font-medium hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-colors"
      >
        <FileSpreadsheet className="h-4 w-4" />
        Exportar Excel
      </Button>
    </header>
  )
}
