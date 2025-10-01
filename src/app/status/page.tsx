'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { format, parseISO, isAfter, isToday } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'

interface OrderStatus {
  id: string
  orderNumber: number
  status: string
  stage: string
  dueDate?: string
  rush: boolean
  client: {
    first_name: string
    last_name: string
  }
  garments: Array<{
    id: string
    type: string
    label_code: string
  }>
  tasks: Array<{
    id: string
    stage: string
    assignee?: string
  }>
}

export default function StatusPage() {
  const t = useTranslations('status')
  const [phone, setPhone] = useState('')
  const [lastName, setLastName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<OrderStatus | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!phone.trim() || !lastName.trim()) {
      setError(t('errors.required'))
      return
    }

    setLoading(true)
    setError(null)
    setOrder(null)

    try {
      const response = await fetch(`/api/order/search?phone=${encodeURIComponent(phone)}&lastName=${encodeURIComponent(lastName)}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || t('errors.searchFailed'))
      }

      const data = await response.json()
      setOrder(data.order)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.searchFailed'))
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-gray-600 bg-gray-100'
      case 'working':
        return 'text-blue-600 bg-blue-100'
      case 'done':
        return 'text-green-600 bg-green-100'
      case 'ready':
        return 'text-yellow-600 bg-yellow-100'
      case 'delivered':
        return 'text-purple-600 bg-purple-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'pending':
        return 'text-gray-600 bg-gray-100'
      case 'working':
        return 'text-blue-600 bg-blue-100'
      case 'done':
        return 'text-green-600 bg-green-100'
      case 'ready':
        return 'text-yellow-600 bg-yellow-100'
      case 'delivered':
        return 'text-purple-600 bg-purple-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const isOverdue = order?.dueDate && isAfter(new Date(), parseISO(order.dueDate))
  const isDueToday = order?.dueDate && isToday(parseISO(order.dueDate))

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">{t('title')}</h1>
          <p className="text-center text-gray-600">
            {t('description')}
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{t('search.title')}</CardTitle>
            <CardDescription>
              {t('search.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('search.phone')} *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t('search.phonePlaceholder')}
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('search.lastName')} *
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={t('search.lastNamePlaceholder')}
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-lg"
              >
                {loading ? t('search.searching') : t('search.search')}
              </Button>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Status */}
        {order && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {t('order.title')} #{order.orderNumber}
                  </CardTitle>
                  <CardDescription>
                    {order.client.first_name} {order.client.last_name}
                  </CardDescription>
                </div>
                {order.rush && (
                  <span className="px-3 py-1 text-sm font-bold text-white bg-red-500 rounded-full">
                    {t('order.rush')}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status and Stage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">{t('order.status')}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {t(`order.statuses.${order.status}`)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">{t('order.stage')}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStageColor(order.stage)}`}>
                    {t(`order.stages.${order.stage}`)}
                  </span>
                </div>
              </div>

              {/* Due Date */}
              {order.dueDate && (
                <div>
                  <h3 className="text-lg font-medium mb-2">{t('order.dueDate')}</h3>
                  <p className={`text-lg ${
                    isOverdue ? 'text-red-600 font-medium' : 
                    isDueToday ? 'text-orange-600 font-medium' : 
                    'text-gray-600'
                  }`}>
                    {format(parseISO(order.dueDate), 'PPP', { 
                      locale: t('locale') === 'fr' ? fr : enUS 
                    })}
                    {isOverdue && ` (${t('order.overdue')})`}
                    {isDueToday && ` (${t('order.dueToday')})`}
                  </p>
                </div>
              )}

              {/* Garments */}
              <div>
                <h3 className="text-lg font-medium mb-3">{t('order.garments')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {order.garments.map((garment, index) => (
                    <div key={garment.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{garment.type}</p>
                          <p className="text-sm text-gray-600">
                            {t('order.labelCode')}: {garment.label_code}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {t('order.garment')} #{index + 1}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks */}
              {order.tasks.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-3">{t('order.tasks')}</h3>
                  <div className="space-y-2">
                    {order.tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStageColor(task.stage)}`}>
                            {t(`order.stages.${task.stage}`)}
                          </span>
                          <span className="text-sm text-gray-600">
                            {task.assignee || t('order.unassigned')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-4 pt-4 border-t">
                <Button
                  onClick={() => window.open(`/api/labels/${order.id}`, '_blank')}
                  className="flex-1"
                >
                  {t('actions.printLabels')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setOrder(null)
                    setPhone('')
                    setLastName('')
                    setError(null)
                  }}
                  className="flex-1"
                >
                  {t('actions.newSearch')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
