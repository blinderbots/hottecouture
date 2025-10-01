import { describe, it, expect } from 'vitest'
import {
  isValidStageTransition,
  getOrderStatusFromTasks,
  calculateStageTransition,
  getValidNextStages,
  canOrderMoveToStatus,
  getMinimumStageForOrderStatus,
  type TaskWithStage,
  type OrderWithTasks,
} from '@/lib/board/stage-transitions'

describe('Stage Transitions', () => {
  describe('isValidStageTransition', () => {
    it('should allow valid transitions', () => {
      expect(isValidStageTransition('pending', 'working')).toBe(true)
      expect(isValidStageTransition('working', 'done')).toBe(true)
      expect(isValidStageTransition('done', 'ready')).toBe(true)
      expect(isValidStageTransition('ready', 'delivered')).toBe(true)
      expect(isValidStageTransition('delivered', 'ready')).toBe(true)
    })

    it('should allow going back to working from done', () => {
      expect(isValidStageTransition('done', 'working')).toBe(true)
    })

    it('should allow going back to pending from working', () => {
      expect(isValidStageTransition('working', 'pending')).toBe(true)
    })

    it('should reject invalid transitions', () => {
      expect(isValidStageTransition('pending', 'done')).toBe(false)
      expect(isValidStageTransition('pending', 'ready')).toBe(false)
      expect(isValidStageTransition('pending', 'delivered')).toBe(false)
      expect(isValidStageTransition('working', 'ready')).toBe(false)
      expect(isValidStageTransition('working', 'delivered')).toBe(false)
      expect(isValidStageTransition('done', 'delivered')).toBe(false)
    })
  })

  describe('getOrderStatusFromTasks', () => {
    it('should return delivered when all tasks are delivered', () => {
      const tasks: TaskWithStage[] = [
        { id: '1', stage: 'delivered', order_id: 'order-1' },
        { id: '2', stage: 'delivered', order_id: 'order-1' },
      ]
      expect(getOrderStatusFromTasks(tasks)).toBe('delivered')
    })

    it('should return ready when all tasks are ready or delivered', () => {
      const tasks: TaskWithStage[] = [
        { id: '1', stage: 'ready', order_id: 'order-1' },
        { id: '2', stage: 'delivered', order_id: 'order-1' },
      ]
      expect(getOrderStatusFromTasks(tasks)).toBe('ready')
    })

    it('should return done when all tasks are done or beyond', () => {
      const tasks: TaskWithStage[] = [
        { id: '1', stage: 'done', order_id: 'order-1' },
        { id: '2', stage: 'ready', order_id: 'order-1' },
      ]
      expect(getOrderStatusFromTasks(tasks)).toBe('done')
    })

    it('should return working when any task is working', () => {
      const tasks: TaskWithStage[] = [
        { id: '1', stage: 'working', order_id: 'order-1' },
        { id: '2', stage: 'done', order_id: 'order-1' },
      ]
      expect(getOrderStatusFromTasks(tasks)).toBe('working')
    })

    it('should return pending when all tasks are pending', () => {
      const tasks: TaskWithStage[] = [
        { id: '1', stage: 'pending', order_id: 'order-1' },
        { id: '2', stage: 'pending', order_id: 'order-1' },
      ]
      expect(getOrderStatusFromTasks(tasks)).toBe('pending')
    })

    it('should return pending for empty tasks array', () => {
      expect(getOrderStatusFromTasks([])).toBe('pending')
    })
  })

  describe('calculateStageTransition', () => {
    const mockOrder: OrderWithTasks = {
      id: 'order-1',
      status: 'working',
      tasks: [
        { id: 'task-1', stage: 'working', order_id: 'order-1' },
        { id: 'task-2', stage: 'pending', order_id: 'order-1' },
      ],
    }

    it('should calculate valid transition correctly', () => {
      const result = calculateStageTransition('task-1', 'done', mockOrder)
      
      expect(result.fromStage).toBe('working')
      expect(result.toStage).toBe('done')
      expect(result.isValid).toBe(true)
      expect(result.orderStatusUpdate).toBe('working') // Still working because task-2 is pending
    })

    it('should calculate invalid transition correctly', () => {
      const result = calculateStageTransition('task-1', 'ready', mockOrder)
      
      expect(result.fromStage).toBe('working')
      expect(result.toStage).toBe('ready')
      expect(result.isValid).toBe(false)
      expect(result.orderStatusUpdate).toBeUndefined()
    })

    it('should throw error for non-existent task', () => {
      expect(() => {
        calculateStageTransition('non-existent', 'done', mockOrder)
      }).toThrow('Task non-existent not found in order order-1')
    })

    it('should update order status when all tasks are done', () => {
      const orderWithAllDone: OrderWithTasks = {
        id: 'order-1',
        status: 'working',
        tasks: [
          { id: 'task-1', stage: 'done', order_id: 'order-1' },
          { id: 'task-2', stage: 'working', order_id: 'order-1' },
        ],
      }

      const result = calculateStageTransition('task-2', 'done', orderWithAllDone)
      
      expect(result.isValid).toBe(true)
      expect(result.orderStatusUpdate).toBe('done')
    })
  })

  describe('getValidNextStages', () => {
    it('should return correct next stages for each stage', () => {
      expect(getValidNextStages('pending')).toEqual(['working'])
      expect(getValidNextStages('working')).toEqual(['done', 'pending'])
      expect(getValidNextStages('done')).toEqual(['ready', 'working'])
      expect(getValidNextStages('ready')).toEqual(['delivered', 'done'])
      expect(getValidNextStages('delivered')).toEqual(['ready'])
    })
  })

  describe('canOrderMoveToStatus', () => {
    const mockOrder: OrderWithTasks = {
      id: 'order-1',
      status: 'working',
      tasks: [
        { id: 'task-1', stage: 'working', order_id: 'order-1' },
        { id: 'task-2', stage: 'pending', order_id: 'order-1' },
      ],
    }

    it('should allow valid order status transitions', () => {
      expect(canOrderMoveToStatus(mockOrder, 'done')).toBe(true)
      expect(canOrderMoveToStatus(mockOrder, 'pending')).toBe(true)
      expect(canOrderMoveToStatus(mockOrder, 'archived')).toBe(true)
    })

    it('should reject invalid order status transitions', () => {
      expect(canOrderMoveToStatus(mockOrder, 'ready')).toBe(false)
      expect(canOrderMoveToStatus(mockOrder, 'delivered')).toBe(false)
    })

    it('should allow unarchiving', () => {
      const archivedOrder: OrderWithTasks = {
        id: 'order-1',
        status: 'archived',
        tasks: [],
      }
      expect(canOrderMoveToStatus(archivedOrder, 'pending')).toBe(true)
    })
  })

  describe('getMinimumStageForOrderStatus', () => {
    it('should return correct minimum stages', () => {
      expect(getMinimumStageForOrderStatus('pending')).toBe('pending')
      expect(getMinimumStageForOrderStatus('working')).toBe('working')
      expect(getMinimumStageForOrderStatus('done')).toBe('done')
      expect(getMinimumStageForOrderStatus('ready')).toBe('ready')
      expect(getMinimumStageForOrderStatus('delivered')).toBe('delivered')
      expect(getMinimumStageForOrderStatus('archived')).toBe('pending')
    })
  })
})
