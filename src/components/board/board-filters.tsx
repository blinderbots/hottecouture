'use client'

import { useState } from 'react'
// import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BoardFilters as BoardFiltersType, BoardOrder } from '@/lib/board/types'

interface BoardFiltersProps {
  filters: BoardFiltersType
  onFiltersChange: (filters: BoardFiltersType) => void
  orders: BoardOrder[]
}

export function BoardFilters({ filters, onFiltersChange, orders }: BoardFiltersProps) {
  // const t = useTranslations('board.filters')
  const [isExpanded, setIsExpanded] = useState(false)

  // Get unique assignees from orders
  const assignees = Array.from(
    new Set(
      orders
        .flatMap(order => order.tasks.map(task => task.assignee))
        .filter(Boolean)
    )
  ).sort()

  const handleFilterChange = (key: keyof BoardFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      rush: false,
      dueToday: false,
      search: '',
    })
  }

  const hasActiveFilters = 
    filters.rush || 
    filters.dueToday || 
    filters.assignee || 
    filters.pipeline || 
    filters.search

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Filter orders by various criteria
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
              >
                Clear All
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Quick filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            variant={filters.rush ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('rush', !filters.rush)}
          >
            Rush ({orders.filter(o => o.rush).length})
          </Button>
          
          <Button
            variant={filters.dueToday ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('dueToday', !filters.dueToday)}
          >
            Due Today ({orders.filter(o => o.due_date && new Date(o.due_date).toDateString() === new Date().toDateString()).length})
          </Button>
          
          <Button
            variant={filters.pipeline === 'alteration' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('pipeline', filters.pipeline === 'alteration' ? undefined : 'alteration')}
          >
            Alterations ({orders.filter(o => o.type === 'alteration').length})
          </Button>
          
          <Button
            variant={filters.pipeline === 'custom' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('pipeline', filters.pipeline === 'custom' ? undefined : 'custom')}
          >
            Custom ({orders.filter(o => o.type === 'custom').length})
          </Button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search orders..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Expanded filters */}
        {isExpanded && (
          <div className="space-y-4">
            {/* Assignee filter */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Assignee
              </label>
              <select
                value={filters.assignee || ''}
                onChange={(e) => handleFilterChange('assignee', e.target.value || undefined)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">All Assignees</option>
                {assignees.map(assignee => (
                  <option key={assignee} value={assignee}>
                    {assignee}
                  </option>
                ))}
              </select>
            </div>

            {/* Pipeline filter */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Pipeline
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="pipeline"
                    checked={filters.pipeline === undefined}
                    onChange={() => handleFilterChange('pipeline', undefined)}
                    className="mr-2"
                  />
                  All Orders
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="pipeline"
                    checked={filters.pipeline === 'alteration'}
                    onChange={() => handleFilterChange('pipeline', 'alteration')}
                    className="mr-2"
                  />
                  Alterations
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="pipeline"
                    checked={filters.pipeline === 'custom'}
                    onChange={() => handleFilterChange('pipeline', 'custom')}
                    className="mr-2"
                  />
                  Custom
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Active filters summary */}
        {hasActiveFilters && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800">
              <strong>Active filters:</strong>
              <ul className="mt-1 space-y-1">
                {filters.rush && <li>• Rush orders only</li>}
                {filters.dueToday && <li>• Due today</li>}
                {filters.assignee && <li>• Assigned to: {filters.assignee}</li>}
                {filters.pipeline && <li>• Pipeline: {filters.pipeline}</li>}
                {filters.search && <li>• Search: "{filters.search}"</li>}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
