'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Pause, Clock } from 'lucide-react'

interface TimeTrackingWidgetProps {
  taskId: string
  userId: string
  onTimeUpdate?: (timeSpent: number) => void
}

export function TimeTrackingWidget({ taskId, userId, onTimeUpdate }: TimeTrackingWidgetProps) {
  const [isActive, setIsActive] = useState(false)
  const [sessionTime, setSessionTime] = useState(0)
  const [totalTime, setTotalTime] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkActiveTask()
    // Check for active task every 30 seconds
    const interval = setInterval(checkActiveTask, 30000)
    return () => clearInterval(interval)
  }, [userId])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isActive) {
      timer = setInterval(() => {
        setSessionTime(prev => prev + 1)
      }, 60000) // Update every minute
    }
    return () => clearInterval(timer)
  }, [isActive])

  const checkActiveTask = async () => {
    try {
      const response = await fetch(`/api/time-tracking/active?userId=${userId}`)
      const result = await response.json()
      
      if (result.success && result.activeTask) {
        setIsActive(true)
        setSessionTime(result.activeTask.sessionMinutes || 0)
        setTotalTime(result.activeTask.actual_minutes || 0)
      } else {
        setIsActive(false)
        setSessionTime(0)
      }
    } catch (error) {
      console.error('Error checking active task:', error)
    }
  }

  const startTask = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/time-tracking/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, userId })
      })
      
      const result = await response.json()
      if (result.success) {
        setIsActive(true)
        setSessionTime(0)
        checkActiveTask()
      }
    } catch (error) {
      console.error('Error starting task:', error)
    } finally {
      setLoading(false)
    }
  }

  const stopTask = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/time-tracking/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, userId })
      })
      
      const result = await response.json()
      if (result.success) {
        setIsActive(false)
        setSessionTime(0)
        setTotalTime(result.totalTime)
        onTimeUpdate?.(result.totalTime)
        checkActiveTask()
      }
    } catch (error) {
      console.error('Error stopping task:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
      <Clock className="w-4 h-4 text-gray-600" />
      
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900">
          {isActive ? 'Working...' : 'Ready to work'}
        </div>
        <div className="text-xs text-gray-600">
          Session: {formatTime(sessionTime)} | Total: {formatTime(totalTime)}
        </div>
      </div>

      <div className="flex gap-1">
        {!isActive ? (
          <Button
            size="sm"
            onClick={startTask}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="w-3 h-3 mr-1" />
            Start
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={stopTask}
            disabled={loading}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <Pause className="w-3 h-3 mr-1" />
            Stop
          </Button>
        )}
      </div>
    </div>
  )
}