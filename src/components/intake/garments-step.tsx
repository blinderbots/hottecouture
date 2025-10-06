'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CameraCapture } from '@/components/intake/camera-capture'
import { nanoid } from 'nanoid'

interface GarmentType {
  id: string
  code: string
  name: string
  category: string
  icon: string
  is_common: boolean
}

interface Garment {
  type: string
  garment_type_id?: string
  color?: string
  brand?: string
  notes?: string
  photoPath?: string
  photoDataUrl?: string  // Local data URL for immediate display
  photoFileName?: string // Intended filename for upload
  labelCode: string
  services: Array<{
    serviceId: string
    qty: number
    customPriceCents?: number
  }>
}

interface GarmentsStepProps {
  data: Garment[]
  onUpdate: (garments: Garment[]) => void
  onNext: () => void
  onPrev: () => void
}

export function GarmentsStep({ data, onUpdate, onNext, onPrev }: GarmentsStepProps) {
  const [garmentTypes, setGarmentTypes] = useState<GarmentType[]>([])
  const [groupedTypes, setGroupedTypes] = useState<Record<string, GarmentType[]>>({})
  const [loading, setLoading] = useState(true)
  const [currentGarment, setCurrentGarment] = useState<Partial<Garment>>({
    type: '',
    notes: '',
    labelCode: nanoid(8).toUpperCase(),
    services: []
  })
  const [showAddForm, setShowAddForm] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Load garment types from API
  useEffect(() => {
    const loadGarmentTypes = async () => {
      try {
        const response = await fetch('/api/garment-types')
        if (response.ok) {
          const data = await response.json()
          setGarmentTypes(data.garmentTypes || [])
          setGroupedTypes(data.groupedTypes || {})
        } else {
          console.error('Failed to load garment types')
        }
      } catch (error) {
        console.error('Error loading garment types:', error)
      } finally {
        setLoading(false)
      }
    }
    loadGarmentTypes()
  }, [])

  const addGarment = () => {
    if (!currentGarment.type || !currentGarment.garment_type_id) return

    const newGarment: Garment = {
      type: currentGarment.type,
      garment_type_id: currentGarment.garment_type_id,
      notes: currentGarment.notes || '',
      ...(currentGarment.photoPath && { photoPath: currentGarment.photoPath }),
      labelCode: currentGarment.labelCode || nanoid(8).toUpperCase(),
      services: []
    }

    onUpdate([...data, newGarment])
    setCurrentGarment({
      type: '',
      notes: '',
      labelCode: nanoid(8).toUpperCase(),
      services: []
    })
    setShowAddForm(false)
  }

  const handleGarmentTypeChange = (garmentTypeId: string) => {
    const selectedType = garmentTypes.find(gt => gt.id === garmentTypeId)
    if (selectedType) {
      setCurrentGarment(prev => ({
        ...prev,
        type: selectedType.name,
        garment_type_id: selectedType.id
      }))
    }
  }

  const removeGarment = (index: number) => {
    const updatedGarments = data.filter((_, i) => i !== index)
    onUpdate(updatedGarments)
  }

  const updateGarmentField = (field: keyof Garment, value: any) => {
    setCurrentGarment(prev => ({ ...prev, [field]: value }))
  }

  const handlePhotoCapture = async (imageDataUrl: string) => {
    try {
      console.log('Storing photo locally...')
      
      // Convert data URL to file
      const response = await fetch(imageDataUrl)
      const blob = await response.blob()
      const fileName = `garment-${nanoid()}.jpg`
      
      console.log('Photo stored locally:', fileName, 'Size:', blob.size)
      
      // Store locally for now - will upload when order is submitted
      setCurrentGarment(prev => ({ 
        ...prev, 
        photoDataUrl: imageDataUrl, // Store the data URL locally
        photoFileName: fileName,    // Store the intended filename
        // photoPath will be set after upload
      }))
      
      console.log('Photo stored locally successfully')
    } catch (error) {
      console.error('Photo capture failed:', error)
      setUploadError(`Photo capture failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading garment types...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Garments</CardTitle>
        <CardDescription>
          Add garments that need alterations or custom work
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!showAddForm ? (
          <Button onClick={() => setShowAddForm(true)} className="w-full">
            Add Garment
          </Button>
        ) : (
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
            <div>
              <label htmlFor="garmentType" className="block text-sm font-medium mb-1">
                Garment Type *
              </label>
              <select
                id="garmentType"
                value={currentGarment.garment_type_id || ''}
                onChange={(e) => handleGarmentTypeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select garment type</option>
                {Object.entries(groupedTypes).map(([category, types]) => (
                  <optgroup key={category} label={category}>
                    {types.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.icon} {type.name}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="labelCode" className="block text-sm font-medium mb-1">
                Label Code
              </label>
              <input
                id="labelCode"
                type="text"
                value={currentGarment.labelCode}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                placeholder="Auto-generated"
              />
              <p className="text-xs text-gray-500 mt-1">This code will be used to identify the garment</p>
            </div>

            <div>
              <label htmlFor="garmentNotes" className="block text-sm font-medium mb-1">
                Notes
              </label>
              <textarea
                id="garmentNotes"
                value={currentGarment.notes}
                onChange={(e) => updateGarmentField('notes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Special instructions, damage notes, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Photo
              </label>
              <div className="space-y-3">
                {(currentGarment.photoPath || currentGarment.photoDataUrl) ? (
                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {currentGarment.photoDataUrl ? (
                        <img 
                          src={currentGarment.photoDataUrl} 
                          alt="Garment photo" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm text-gray-600">📷</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentGarment(prev => { 
                          const { photoPath, photoDataUrl, photoFileName, ...rest } = prev
                          return rest
                        })}
                      >
                        Remove Photo
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <CameraCapture
                      onCapture={handlePhotoCapture}
                      onCancel={() => {}}
                    />
                  </div>
                )}
                {uploadError && (
                  <div className="text-red-600 text-sm">
                    {uploadError}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={addGarment}
                disabled={!currentGarment.type || !currentGarment.garment_type_id}
                className="flex-1"
              >
                Add Garment
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {data.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Added Garments ({data.length})</h3>
            {data.map((garment, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {(garment.photoPath || garment.photoDataUrl) && (
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {garment.photoDataUrl ? (
                        <img 
                          src={garment.photoDataUrl} 
                          alt="Garment photo" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-gray-600">📷</span>
                      )}
                    </div>
                  )}
                  <div>
                    <div className="font-medium">{garment.type}</div>
                    <div className="text-sm text-gray-600">
                      Label: {garment.labelCode}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeGarment(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrev}>
            Previous
          </Button>
          <Button 
            onClick={onNext} 
            disabled={data.length === 0}
          >
            Continue to Services
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}