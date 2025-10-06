'use client'

import { useDraggable } from '@dnd-kit/core'
import { Button } from '@/components/ui/button'
import { RushIndicator, RushOrderCard } from '@/components/rush-orders/rush-indicator'

interface DraggableOrderCardProps {
  order: any
  onClick: () => void
  isJustMoved?: boolean
  isUpdating?: boolean
}

export function DraggableOrderCard({ order, onClick, isJustMoved = false, isUpdating = false }: DraggableOrderCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id: order.id })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  }

  return (
    <RushOrderCard
      isRush={order.rush || false}
      orderType={order.type || 'alteration'}
      className={`
        cursor-grab active:cursor-grabbing
        hover:shadow-md transition-all duration-200 touch-manipulation select-none
        ${isDragging 
          ? 'opacity-60 shadow-2xl scale-105 rotate-2 z-50' 
          : isJustMoved
          ? 'ring-2 ring-green-400 ring-opacity-50 bg-green-50 animate-pulse'
          : isUpdating
          ? 'ring-2 ring-blue-400 ring-opacity-50 bg-blue-50 opacity-80'
          : 'hover:scale-[1.02] hover:shadow-lg'
        }
      `}
    >
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`p-2 sm:p-3 transition-all duration-200 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onClick={() => {
          // Only trigger click if not dragging
          if (!isDragging) {
            onClick()
          }
        }}
      >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className="text-gray-400 text-xs cursor-grab active:cursor-grabbing hover:text-gray-600 transition-colors duration-200">
            ⋮⋮
          </div>
          <h4 className="font-semibold text-sm sm:text-base">#{order.order_number}</h4>
          {isUpdating && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-600">Updating...</span>
            </div>
          )}
        </div>
        <RushIndicator
          isRush={order.rush || false}
          orderType={order.type || 'alteration'}
          size="sm"
        />
      </div>
      
      <p className="text-xs sm:text-sm text-gray-600 mb-1">
        {order.client_name || 'Unknown Client'}
      </p>
      
      <p className="text-xs text-gray-500 mb-1">
        {order.garments?.map((g: any) => g.type).join(', ') || 'No garments'}
      </p>


      
      {order.due_date && (
        <p className="text-xs text-gray-500 mb-1">
          Due: {new Date(order.due_date).toLocaleDateString()}
        </p>
      )}

      {order.rack_position && (
        <p className="text-xs text-blue-600 font-medium">
          Rack: {order.rack_position}
        </p>
      )}

      <div className="mt-2 pt-2 border-t border-gray-100">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs sm:text-sm py-1 sm:py-2"
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation()
            e.preventDefault()
            onClick()
          }}
        >
          View Details
        </Button>
      </div>
      </div>
    </RushOrderCard>
  )
}
