'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Ruler, Search, Filter, Eye, Download } from 'lucide-react'
import { MeasurementVisualization } from '@/components/measurements/measurement-visualization'
import { MeasurementSet } from '@/lib/measurements/measurement-types'

interface MeasurementRecord {
  id: string
  order_id: string
  garment_id: string
  taken_by: string
  measurements: MeasurementSet
  taken_at: string
  order?: {
    order_number: string
    client?: {
      first_name: string
      last_name: string
    }
  }
  garment?: {
    type: string
    color?: string
  }
}

export default function MeasurementsPage() {
  const [measurements, setMeasurements] = useState<MeasurementRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMeasurement, setSelectedMeasurement] = useState<MeasurementRecord | null>(null)
  const [filterBy, setFilterBy] = useState<'all' | 'complete' | 'incomplete'>('all')

  useEffect(() => {
    fetchMeasurements()
  }, [])

  const fetchMeasurements = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/measurements')
      
      if (!response.ok) {
        throw new Error('Failed to fetch measurements')
      }

      const result = await response.json()
      setMeasurements(result.measurements || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch measurements')
    } finally {
      setLoading(false)
    }
  }

  const filteredMeasurements = measurements.filter(record => {
    const matchesSearch = searchTerm === '' || 
      record.order?.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.order?.client?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.order?.client?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.garment?.type?.toLowerCase().includes(searchTerm.toLowerCase())

    const isComplete = record.measurements.points.filter(p => p.isRequired).every(p => p.value !== undefined)
    
    const matchesFilter = filterBy === 'all' || 
      (filterBy === 'complete' && isComplete) ||
      (filterBy === 'incomplete' && !isComplete)

    return matchesSearch && matchesFilter
  })

  const getCompletionStatus = (record: MeasurementRecord) => {
    const requiredPoints = record.measurements.points.filter(p => p.isRequired)
    const completedRequired = requiredPoints.filter(p => p.value !== undefined).length
    const totalRequired = requiredPoints.length
    
    return {
      completed: completedRequired,
      total: totalRequired,
      percentage: Math.round((completedRequired / totalRequired) * 100)
    }
  }

  const handleDownload = (record: MeasurementRecord) => {
    const data = {
      orderNumber: record.order?.order_number,
      clientName: `${record.order?.client?.first_name || ''} ${record.order?.client?.last_name || ''}`.trim(),
      garmentType: record.garment?.type,
      measurements: record.measurements,
      takenBy: record.taken_by,
      takenAt: record.taken_at
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `measurements-${record.order?.order_number || record.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading measurements...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Measurements</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchMeasurements} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">Measurements Management</h1>
          <p className="text-center text-gray-600">View and manage all garment measurements</p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search by order number, client name, or garment type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="filter">Filter</Label>
                <select
                  id="filter"
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Measurements</option>
                  <option value="complete">Complete Only</option>
                  <option value="incomplete">Incomplete Only</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={fetchMeasurements} variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Measurements List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredMeasurements.map((record) => {
            const status = getCompletionStatus(record)
            const isComplete = status.percentage === 100

            return (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        Order #{record.order?.order_number || 'Unknown'}
                      </CardTitle>
                      <CardDescription>
                        {record.order?.client?.first_name} {record.order?.client?.last_name}
                      </CardDescription>
                    </div>
                    <Badge variant={isComplete ? "default" : "secondary"}>
                      {status.percentage}% Complete
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Garment:</span>
                      <span className="font-medium">{record.garment?.type}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Color:</span>
                      <span className="font-medium">{record.garment?.color || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Taken by:</span>
                      <span className="font-medium">{record.taken_by}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {new Date(record.taken_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress:</span>
                      <span className="font-medium">
                        {status.completed}/{status.total} required
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedMeasurement(record)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(record)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredMeasurements.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Ruler className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No measurements found</h3>
              <p className="text-gray-500">
                {searchTerm || filterBy !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No measurements have been recorded yet'
                }
              </p>
            </CardContent>
          </Card>
        )}

        {/* Measurement Detail Modal */}
        {selectedMeasurement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">
                    Measurements for Order #{selectedMeasurement.order?.order_number}
                  </h2>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedMeasurement(null)}
                  >
                    Close
                  </Button>
                </div>
                <MeasurementVisualization
                  measurements={selectedMeasurement.measurements}
                  onDownload={() => handleDownload(selectedMeasurement)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
