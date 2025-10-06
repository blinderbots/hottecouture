'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, XCircle, Clock, RefreshCw, CreditCard, Banknote } from 'lucide-react'
import { formatPaymentAmount } from '@/lib/payments/payment-types'

interface PaymentStatusProps {
  orderId: string
  className?: string
}

interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded'
  paymentMethod: string
  provider: string
  createdAt: string
  updatedAt: string
}

interface PaymentSummary {
  totalAmount: number
  paidAmount: number
  refundedAmount: number
  remainingAmount: number
  status: 'pending' | 'partial' | 'paid' | 'refunded'
}

export function PaymentStatus({ orderId, className = '' }: PaymentStatusProps) {
  const [paymentIntents, setPaymentIntents] = useState<PaymentIntent[]>([])
  const [summary, setSummary] = useState<PaymentSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPaymentStatus()
  }, [orderId])

  const fetchPaymentStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/payments/status?orderId=${orderId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment status')
      }

      const data = await response.json()
      setPaymentIntents(data.paymentIntents || [])
      setSummary(data.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment status')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'refunded':
        return <RefreshCw className="w-5 h-5 text-orange-600" />
      case 'processing':
        return <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded':
        return 'bg-green-100 text-green-800'
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-orange-100 text-orange-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    if (method.includes('card')) {
      return <CreditCard className="w-4 h-4" />
    }
    return <Banknote className="w-4 h-4" />
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Payment Summary */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
            <CardDescription>Overall payment status for this order</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPaymentAmount(summary.totalAmount)}
                  </div>
                  <div className="text-sm text-gray-600">Total Amount</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatPaymentAmount(summary.paidAmount)}
                  </div>
                  <div className="text-sm text-gray-600">Paid</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatPaymentAmount(summary.refundedAmount)}
                  </div>
                  <div className="text-sm text-gray-600">Refunded</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {formatPaymentAmount(summary.remainingAmount)}
                  </div>
                  <div className="text-sm text-gray-600">Remaining</div>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <Badge className={getStatusColor(summary.status)}>
                  {summary.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>All payment attempts for this order</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchPaymentStatus}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {paymentIntents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No payments found for this order</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentIntents.map((intent) => (
                <div
                  key={intent.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(intent.status)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">
                          {formatPaymentAmount(intent.amount)}
                        </span>
                        <Badge className={getStatusColor(intent.status)}>
                          {intent.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {intent.paymentMethod} • {intent.provider}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(intent.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getPaymentMethodIcon(intent.paymentMethod)}
                    <span className="text-sm text-gray-600">
                      {intent.paymentMethod}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
