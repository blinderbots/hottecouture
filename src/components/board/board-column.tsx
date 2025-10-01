'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useTranslations } from 'next-intl'
import { OrderCard } from './order-card'
import { BoardOrder, TaskStage } from '@/lib/board/types'

interface BoardColumnProps {
  id: TaskStage
  title: string
  orders: BoardOrder[]
  updating: Set<string>
}

export function BoardColumn({ id, title, orders, updating }: BoardColumnProps) {
  const t = useTranslations('board.columns')
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  const getColumnColor = (stage: TaskStage) => {
    switch (stage) {
      case 'pending':
        return 'border-gray-300 bg-gray-50'
      case 'working':
        return 'border-blue-300 bg-blue-50'
      case 'done':
        return 'border-green-300 bg-green-50'
      case 'ready':
        return 'border-yellow-300 bg-yellow-50'
      case 'delivered':
        return 'border-purple-300 bg-purple-50'
      default:
        return 'border-gray-300 bg-gray-50'
    }
  }

  const getColumnTextColor = (stage: TaskStage) => {
    switch (stage) {
      case 'pending':
        return 'text-gray-700'
      case 'working':
        return 'text-blue-700'
      case 'done':
        return 'text-green-700'
      case 'ready':
        return 'text-yellow-700'
      case 'delivered':
        return 'text-purple-700'
      default:
        return 'text-gray-700'
    }
  }

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[400px] p-4 rounded-lg border-2 transition-colors ${
        isOver ? 'border-primary bg-primary/5' : getColumnColor(id)
      }`}
    >
      <div className="mb-4">
        <h3 className={`text-lg font-semibold ${getColumnTextColor(id)}`}>
          {t(id as any) || title}
        </h3>
        <p className="text-sm text-gray-600">
          {orders.length} order{orders.length !== 1 ? 's' : ''}
        </p>
      </div>

      <SortableContext
        items={orders.map(order => order.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {orders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              isUpdating={updating.has(order.id)}
            />
          ))}
        </div>
      </SortableContext>

      {orders.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <p className="text-sm">No orders in this stage</p>
        </div>
      )}
    </div>
  )
}
