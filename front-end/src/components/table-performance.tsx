'use client'

import { api } from '@/lib/api'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { ArrowUpDown, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export type PerformanceManutencao = {
  Familia: string
  DF: number
  MTBF: number
  MTTR: number
  Paradas: number
  tempo_prev: number
  tempo_corretiva: number
}

type SortConfig = {
  key: keyof PerformanceManutencao | null
  direction: 'asc' | 'desc'
}

export function MaintenancePerformanceGrid() {
  const [data, setData] = useState<PerformanceManutencao[]>([])
  const [loading, setLoading] = useState(false)
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: 'asc',
  })
  const [globalFilter, setGlobalFilter] = useState('')
  const [filters, setFilters] = useState({
    startDate: dayjs().subtract(30, 'days').format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    typeMaintenance: '',
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await api.get<{
        success: boolean
        data: PerformanceManutencao[]
      }>('/maintenance/reports/performance-indicator', {
        params: {
          startDate: filters.startDate,
          endDate: filters.endDate,
          typeMaintenance: filters.typeMaintenance,
        },
      })
      setData(response.data.data || [])
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
      // Usar dados mock para demonstração
      const { mockPerformanceData } = await import('@/lib/mock-data')
      setData(mockPerformanceData)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSort = (key: keyof PerformanceManutencao) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  // Filtro global: busca em todas as colunas
  const filteredData = data.filter((item) => {
    if (!globalFilter) return true
    
    const searchTerm = globalFilter.toLowerCase()
    
    return (
      item.Familia.toLowerCase().includes(searchTerm) ||
      item.DF.toString().includes(searchTerm) ||
      item.MTBF.toString().includes(searchTerm) ||
      item.MTTR.toString().includes(searchTerm) ||
      item.Paradas.toString().includes(searchTerm) ||
      item.tempo_prev.toString().includes(searchTerm) ||
      item.tempo_corretiva.toString().includes(searchTerm)
    )
  })

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0

    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  const SortButton = ({
    column,
    children,
  }: {
    column: keyof PerformanceManutencao
    children: React.ReactNode
  }) => {
    const isActive = sortConfig.key === column
    return (
      <button
        onClick={() => handleSort(column)}
        className="flex items-center gap-2 hover:text-blue-700 transition-all duration-150 font-semibold text-xs uppercase text-gray-700 tracking-wider group"
      >
        {children}
        {isActive ? (
          sortConfig.direction === 'asc' ? (
            <ChevronUp className="h-3.5 w-3.5 text-blue-600" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-blue-600" />
          )
        ) : (
          <ArrowUpDown className="h-3.5 w-3.5 opacity-40 group-hover:opacity-70" />
        )}
      </button>
    )
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-auto bg-gray-50">
      {/* Barra de Filtros */}
      <div className="bg-white border-b shadow-sm">
        <div className="flex items-end gap-4 p-6">
          {/* Filtro Global */}
          <div className="flex flex-col gap-1.5 flex-1 max-w-md">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Buscar em todos os campos
            </label>
            <Input
              type="text"
              placeholder="Digite para filtrar: família, DF, MTBF, MTTR..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="h-10 w-px bg-gray-200"></div>

          {/* Filtros de Data */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Data Inicial</label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="h-10 w-44 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Data Final</label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="h-10 w-44 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <Button 
              onClick={fetchData} 
              size="sm" 
              className="h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 shadow-sm"
            >
              Buscar Dados
            </Button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="flex-1 overflow-auto bg-white m-6 rounded-lg shadow-sm border border-gray-200">
        <Table>
          <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
            <TableRow className="border-b border-gray-200">
              <TableHead className="border-r border-gray-200 py-4">
                <SortButton column="Familia">Família</SortButton>
              </TableHead>
              <TableHead className="border-r border-gray-200 py-4">
                <SortButton column="DF">DF (%)</SortButton>
              </TableHead>
              <TableHead className="border-r border-gray-200 py-4">
                <SortButton column="MTBF">MTBF (h)</SortButton>
              </TableHead>
              <TableHead className="border-r border-gray-200 py-4">
                <SortButton column="MTTR">MTTR (h)</SortButton>
              </TableHead>
              <TableHead className="border-r border-gray-200 py-4">
                <SortButton column="Paradas">Paradas</SortButton>
              </TableHead>
              <TableHead className="border-r border-gray-200 py-4">
                <SortButton column="tempo_prev">Tempo Previsto (h)</SortButton>
              </TableHead>
              <TableHead className="py-4">
                <SortButton column="tempo_corretiva">Tempo Corretiva (h)</SortButton>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-96 text-center bg-gray-50">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-sm text-gray-600 font-medium">Carregando indicadores de performance...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-96 text-center bg-gray-50"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-gray-500 font-medium">Nenhum resultado encontrado</p>
                    <p className="text-sm text-gray-400">Ajuste os filtros e tente novamente</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((row, index) => (
                <TableRow 
                  key={index} 
                  className="hover:bg-blue-50/50 transition-colors duration-150 border-b border-gray-100"
                >
                  <TableCell className="border-r border-gray-100 font-semibold text-gray-900 py-4">
                    {row.Familia}
                  </TableCell>
                  <TableCell className="border-r border-gray-100 text-gray-700 py-4">
                    <span className="font-medium">
                      {row.DF?.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}%
                    </span>
                  </TableCell>
                  <TableCell className="border-r border-gray-100 text-gray-700 py-4">
                    {row.MTBF?.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="border-r border-gray-100 text-gray-700 py-4">
                    {row.MTTR?.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="border-r border-gray-100 text-gray-700 py-4 font-medium">
                    {row.Paradas}
                  </TableCell>
                  <TableCell className="border-r border-gray-100 text-gray-700 py-4">
                    {row.tempo_prev?.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-gray-700 py-4">
                    {row.tempo_corretiva?.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t bg-white px-6 py-4 text-sm text-gray-600 shadow-sm">
        <div className="font-medium">
          {sortedData.length > 0
            ? `${sortedData.length} registro${sortedData.length !== 1 ? 's' : ''} encontrado${sortedData.length !== 1 ? 's' : ''}`
            : 'Nenhum registro encontrado'}
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Linhas por página</span>
            <select className="border border-gray-300 rounded-md px-3 py-1.5 text-sm font-medium focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white">
              <option>10</option>
              <option>25</option>
              <option>50</option>
              <option>100</option>
            </select>
          </div>
          <span className="text-gray-500">
            Página <span className="font-semibold text-gray-700">1</span> de{' '}
            <span className="font-semibold text-gray-700">{Math.ceil(sortedData.length / 10) || 0}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
