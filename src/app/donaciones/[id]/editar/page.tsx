'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useSweetAlert } from '../../../../hooks/useSweetAlert'



export default function EditarDonacionPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState('')
  const [donacion, setDonacion] = useState<any>(null)
  const [proyectos, setProyectos] = useState<any[]>([])
  const [renglones, setRenglones] = useState<any[]>([])
  const [formData, setFormData] = useState({
    monto: '',
    fecha: '',
    donante: '',
    proyectoId: '',
    renglonId: ''
  })
  const { confirmDelete, showSuccess, showError, showLoading, closeLoading, confirmAction } = useSweetAlert()

  const fetchDonacion = useCallback(async () => {
    try {
      setLoadingData(true)
      const response = await fetch(`/api/donaciones?id=${params?.id}`)
      const data = await response.json()
      
      if (data.success) {
        setDonacion(data.data)
        setFormData({
          monto: data.data?.monto?.toString() || '',
          fecha: data.data?.fecha ? data.data.fecha.split('T')[0] : '',
          donante: data.data?.donante || '',
          proyectoId: data.data?.proyectoId?.toString() || '',
          renglonId: data.data?.renglonId?.toString() || ''
        })
        // Cargar renglones del proyecto actual
        await fetchRenglones(data.data?.proyectoId?.toString() || '')
      } else {
        setError('Error al cargar la donación')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoadingData(false)
    }
  }, [params?.id])

  const fetchProyectos = async () => {
    try {
      const response = await fetch('/api/proyectos')
      const data = await response.json()
      
      if (data.success) {
        setProyectos(data.data)
      } else {
        setError('Error al cargar los proyectos')
      }
    } catch (err) {
      setError('Error de conexión')
    }
  }

  const fetchRenglones = async (proyectoId: string) => {
    if (!proyectoId) {
      setRenglones([])
      return
    }

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
    if (params?.id) {
      fetchDonacion()
      fetchProyectos()
    }
  }, [params?.id, fetchDonacion])

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
    
    const confirmed = await confirmAction(
      '¿Guardar cambios?',
      '¿Estás seguro de que quieres guardar los cambios realizados a la donación?',
      'Sí, guardar'
    )

    if (!confirmed) return

    setLoading(true)
    setError('')

    try {
      showLoading('Guardando...', 'Por favor espera mientras guardamos los cambios')
      
      const response = await fetch(`/api/donaciones?id=${params?.id}`, {
        method: 'PUT',
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
        showSuccess('¡Guardado!', 'La donación ha sido actualizada exitosamente')
        router.push('/proyectos')
      } else {
        showError('Error', data.message || 'Error al actualizar la donación')
      }
    } catch (err) {
      closeLoading()
      showError('Error de conexión', 'No se pudo conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!donacion) return

    const confirmed = await confirmDelete(
      '¿Eliminar donación?',
      `¿Estás seguro de que quieres eliminar la donación de "${donacion?.donante}" por Q${donacion?.monto}? Esta acción no se puede deshacer.`,
      'donación'
    )

    if (!confirmed) return

    setLoading(true)
    setError('')

    try {
      showLoading('Eliminando...', 'Por favor espera mientras eliminamos la donación')
      
      const response = await fetch(`/api/donaciones?id=${params?.id}`, {
        method: 'DELETE',
      })

      const data = await response.json()
      closeLoading()

      if (data.success) {
        showSuccess('¡Eliminado!', 'La donación ha sido eliminada exitosamente')
        router.push('/proyectos')
      } else {
        showError('Error', data.message || 'Error al eliminar la donación')
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

  if (!donacion) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Donación no encontrada</h1>
          <Link href="/proyectos" className="mt-4 text-blue-600 hover:text-blue-900">
            Volver a proyectos
          </Link>
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
                Editar Donación
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {donacion?.donante} - Q{donacion?.monto}
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/proyectos"
                className="bg-gray-100 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                Cancelar
              </Link>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-600 px-4 py-2 rounded-md text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                Eliminar
              </button>
            </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  placeholder="Ej: Fundación ABC"
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
            </div>

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
                Renglón de Presupuesto *
              </label>
              <select
                name="renglonId"
                id="renglonId"
                required
                value={formData.renglonId}
                onChange={handleInputChange}
                disabled={!formData.proyectoId || !renglones?.length}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!formData.proyectoId 
                    ? 'Primero selecciona un proyecto...' 
                    : !renglones?.length 
                      ? 'No hay renglones disponibles' 
                      : 'Seleccionar renglón...'
                  }
                </option>
                {renglones?.map((renglon) => (
                  <option key={renglon.id} value={renglon.id}>
                    {renglon.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">
                Fecha de Donación
              </label>
              <input
                type="date"
                name="fecha"
                id="fecha"
                value={formData.fecha}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Link
                href="/proyectos"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </Link>
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
                    Guardando...
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
            </div>
          </form>
        </div>

      
      </div>
    </div>
  )
}
