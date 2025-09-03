'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, useParams } from 'next/navigation'
import Link from 'next/link'
import { useSweetAlert } from '../hooks/useSweetAlert'

interface DonacionFormProps {
  isEditing?: boolean
  donacionId?: number
  initialData?: {
    monto: number
    fecha: string
    donante: string
    proyectoId: number
    renglonId: number
  }
  onClose?: () => void
}

export default function DonacionForm({ isEditing = false, donacionId, initialData, onClose }: DonacionFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [proyectos, setProyectos] = useState<any[]>([])
  const [renglones, setRenglones] = useState<any[]>([])
  const [formData, setFormData] = useState({
    monto: initialData?.monto?.toString() || '',
    fecha: initialData?.fecha || '',
    donante: initialData?.donante || '',
    proyectoId: initialData?.proyectoId?.toString() || searchParams?.get('proyectoId') || '',
    renglonId: initialData?.renglonId?.toString() || ''
  })
  const { confirmAction, showSuccess, showError, showLoading, closeLoading } = useSweetAlert()

  const fetchDonacionData = async () => {
    try {
      setLoadingData(true)
      const response = await fetch(`/api/donaciones?id=${donacionId}`)
      const data = await response.json()
      
      if (data.success) {
        setFormData({
          monto: data.data.monto.toString(),
          fecha: data.data.fecha,
          donante: data.data.donante,
          proyectoId: data.data.proyectoId.toString(),
          renglonId: data.data.renglonId.toString()
        })
      } else {
        setError('Error al cargar los datos de la donación')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoadingData(false)
    }
  }

  const fetchProyectos = async () => {
    try {
      setLoadingData(true)
      const response = await fetch('/api/proyectos')
      const data = await response.json()
      
      if (data.success) {
        setProyectos(data.data)
      } else {
        setError('Error al cargar los proyectos')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoadingData(false)
    }
  }

  const fetchRenglones = async (proyectoId: string) => {
    try {
      const response = await fetch(`/api/renglones?proyectoId=${proyectoId}`)
      const data = await response.json()
      
      if (data.success) {
        setRenglones(data.data)
      } else {
        setError('Error al cargar los renglones')
      }
    } catch (err) {
      setError('Error de conexión')
    }
  }

  useEffect(() => {
    fetchProyectos()
    if (isEditing && donacionId && !initialData) {
      fetchDonacionData()
    }
  }, [isEditing, donacionId, initialData])

  useEffect(() => {
    if (formData.proyectoId) {
      fetchRenglones(formData.proyectoId)
    }
  }, [formData.proyectoId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Si cambia el proyecto, cargar los renglones
    if (name === 'proyectoId') {
      fetchRenglones(value)
      setFormData(prev => ({
        ...prev,
        renglonId: '' // Reset renglón cuando cambia proyecto
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const action = isEditing ? 'actualizar' : 'registrar'
    const confirmed = await confirmAction(
      `¿${action.charAt(0).toUpperCase() + action.slice(1)} donación?`,
      `¿Estás seguro de que quieres ${action} la donación de "${formData.donante}" por Q${formData.monto}?`,
      `Sí, ${action}`
    )

    if (!confirmed) return

    setLoading(true)
    setError('')

    try {
      showLoading(`${isEditing ? 'Actualizando' : 'Registrando'}...`, `Por favor espera mientras ${isEditing ? 'actualizamos' : 'registramos'} la donación`)
      
      const url = isEditing ? `/api/donaciones?id=${donacionId}` : '/api/donaciones'
      const method = isEditing ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          monto: parseFloat(formData.monto),
          proyectoId: parseInt(formData.proyectoId),
          renglonId: parseInt(formData.renglonId)
        }),
      })

      const data = await response.json()
      closeLoading()

      if (data.success) {
        showSuccess(`¡Donación ${isEditing ? 'actualizada' : 'registrada'}!`, `La donación ha sido ${isEditing ? 'actualizada' : 'registrada'} exitosamente`)
        if (onClose) {
          onClose()
        } else {
          router.push('/proyectos')
        }
      } else {
        showError('Error', data.message || `Error al ${action} la donación`)
      }
    } catch (err) {
      closeLoading()
      showError('Error de conexión', 'No se pudo conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {isEditing ? 'Editar Donación' : 'Nueva Donación'}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {isEditing ? 'Modificar los datos de la donación' : 'Registrar una nueva donación para un proyecto'}
              </p>
            </div>
            {onClose ? (
              <button
                onClick={onClose}
                className="bg-gray-100 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Cancelar
              </button>
            ) : (
              <Link
                href="/"
                className="bg-gray-100 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Cancelar
              </Link>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="proyectoId" className="block text-sm font-medium text-gray-700">
                Proyecto *
              </label>
              <select
                name="proyectoId"
                id="proyectoId"
                required
                value={formData.proyectoId}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Seleccionar proyecto...</option>
                {proyectos?.map((proyecto) => (
                  <option key={proyecto.id} value={proyecto.id}>
                    {proyecto.codigo} - {proyecto.nombre} ({proyecto.municipio}, {proyecto.departamento})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="renglonId" className="block text-sm font-medium text-gray-700">
                Renglón *
              </label>
              <select
                name="renglonId"
                id="renglonId"
                required
                value={formData.renglonId}
                onChange={handleInputChange}
                disabled={!formData.proyectoId || !renglones?.length}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
              >
                <option value="">
                  {!formData.proyectoId ? 'Selecciona un proyecto primero' : 
                   !renglones?.length ? 'No hay renglones disponibles' : 'Seleccionar renglón...'}
                </option>
                {renglones?.map((renglon) => (
                  <option key={renglon.id} value={renglon.id}>
                    {renglon.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="donante" className="block text-sm font-medium text-gray-700">
                Donante *
              </label>
              <input
                type="text"
                name="donante"
                id="donante"
                required
                value={formData.donante}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Ej: Fundación ABC, Empresa XYZ, Persona Natural"
              />
            </div>

            <div>
              <label htmlFor="monto" className="block text-sm font-medium text-gray-700">
                Monto (Q) *
              </label>
              <input
                type="number"
                name="monto"
                id="monto"
                required
                min="0.01"
                step="0.01"
                value={formData.monto}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="0.00"
              />
            </div>

            <div>
              <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">
                Fecha *
              </label>
              <input
                type="date"
                name="fecha"
                id="fecha"
                required
                value={formData.fecha}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              {onClose ? (
                <button
                  onClick={onClose}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
              ) : (
                <Link
                  href="/"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </Link>
              )}
              <button
                type="submit"
                disabled={loading || !formData.proyectoId || !formData.renglonId}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isEditing ? 'Actualizando...' : 'Registrando...'}
                  </>
                ) : (
                  isEditing ? 'Actualizar Donación' : 'Registrar Donación'
                )}
              </button>
            </div>
          </form>
        </div>

        
      </div>
    </div>
  )
}
