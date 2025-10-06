'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Ruler, Eye, EyeOff, Download, Share } from 'lucide-react'
import { MeasurementSet, MeasurementPoint } from '@/lib/measurements/measurement-types'

interface MeasurementVisualizationProps {
  measurements: MeasurementSet
  onEdit?: () => void
  onShare?: () => void
  onDownload?: () => void
  className?: string
}

export function MeasurementVisualization({
  measurements,
  onEdit,
  onShare,
  onDownload,
  className = ''
}: MeasurementVisualizationProps) {
  const [showAll, setShowAll] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = Array.from(new Set(measurements.points.map(p => p.category)))
  const filteredPoints = selectedCategory 
    ? measurements.points.filter(p => p.category === selectedCategory)
    : measurements.points

  const displayedPoints = showAll 
    ? filteredPoints 
    : filteredPoints.filter(p => p.value !== undefined)

  const formatValue = (point: MeasurementPoint) => {
    if (point.value === undefined) return 'Not measured'
    return `${point.value.toFixed(1)} ${point.unit}`
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bust': return '👗'
      case 'waist': return '👖'
      case 'hip': return '🩱'
      case 'length': return '📏'
      case 'sleeve': return '👕'
      case 'shoulder': return '👔'
      default: return '📐'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'bust': return 'bg-pink-100 text-pink-800'
      case 'waist': return 'bg-blue-100 text-blue-800'
      case 'hip': return 'bg-purple-100 text-purple-800'
      case 'length': return 'bg-green-100 text-green-800'
      case 'sleeve': return 'bg-orange-100 text-orange-800'
      case 'shoulder': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Ruler className="w-5 h-5" />
                <span>{measurements.name}</span>
              </CardTitle>
              <CardDescription>{measurements.description}</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">
                {measurements.points.filter(p => p.value !== undefined).length} of {measurements.points.length} measured
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                {showAll ? 'Hide Empty' : 'Show All'}
              </Button>
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit}>
                  Edit
                </Button>
              )}
              {onShare && (
                <Button variant="outline" size="sm" onClick={onShare}>
                  <Share className="w-4 h-4 mr-1" />
                  Share
                </Button>
              )}
              {onDownload && (
                <Button variant="outline" size="sm" onClick={onDownload}>
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Measurements by Category */}
      {categories.map(category => {
        const categoryPoints = measurements.points.filter(p => p.category === category)
        const measuredPoints = categoryPoints.filter(p => p.value !== undefined)
        const isSelected = selectedCategory === category || selectedCategory === null
        
        if (!isSelected) return null

        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <span className="text-2xl">{getCategoryIcon(category)}</span>
                <span className="capitalize">{category} Measurements</span>
                <Badge className={getCategoryColor(category)}>
                  {measuredPoints.length}/{categoryPoints.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryPoints.map(point => {
                  const isMeasured = point.value !== undefined
                  const isRequired = point.isRequired
                  
                  return (
                    <div
                      key={point.id}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        isMeasured 
                          ? 'border-green-200 bg-green-50' 
                          : isRequired
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">
                          {point.name}
                          {isRequired && <span className="text-red-500 ml-1">*</span>}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {isMeasured && (
                            <Badge variant="default" className="text-xs">
                              ✓ Measured
                            </Badge>
                          )}
                          {isRequired && !isMeasured && (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{point.description}</p>
                      
                      <div className="space-y-2">
                        <div className="text-lg font-bold">
                          {isMeasured ? formatValue(point) : 'Not measured'}
                        </div>
                        
                        {point.notes && (
                          <div className="text-sm text-gray-600 bg-white p-2 rounded border">
                            <strong>Notes:</strong> {point.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {measurements.points.filter(p => p.value !== undefined).length}
              </div>
              <div className="text-sm text-gray-600">Total Measured</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {measurements.points.filter(p => p.isRequired && p.value !== undefined).length}
              </div>
              <div className="text-sm text-gray-600">Required Complete</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {measurements.points.filter(p => !p.isRequired && p.value !== undefined).length}
              </div>
              <div className="text-sm text-gray-600">Optional Complete</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
