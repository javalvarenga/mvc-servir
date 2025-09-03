'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import MetricCard from '@/components/MetricCard'
import ActivityList from '@/components/ActivityList'
import StatsChart from '@/components/StatsChart'
import { formatCurrency } from '../utils'

interface DashboardData {
  resumen: {
    totalProyectos: number
    totalRenglones: number
    totalDonaciones: number
    totalOrdenes: number
    proyectosActivos: number
    proyectosCompletados: number
    totalDonado: number
    totalGastado: number
    saldoDisponible: number
    porcentajeEjecucion: number
  }
  distribucion: {
    proyectosPorDepartamento: Array<{
      departamento: string
      _count: { id: number }
    }>
    topDonantes: Array<{
      donante: string
      _sum: { monto: number | null }
      _count: { id: number }
    }>
    topProveedores: Array<{
      proveedor: string
      _sum: { monto: number | null }
      _count: { id: number }
    }>
  }
  actividad: {
    donacionesRecientes: Array<{
      id: number
      monto: number
      fecha: string
      donante: string
      proyecto: { codigo: string; nombre: string }
      renglon: { nombre: string }
    }>
    ordenesRecientes: Array<{
      id: number
      numero: string
      proveedor: string
      monto: number
      fecha: string
      proyecto: { codigo: string; nombre: string }
      renglon: { nombre: string }
    }>
  }
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboard')
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        setError(result.message || 'Error al cargar datos del dashboard')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error || 'No se pudieron cargar los datos del dashboard'}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={fetchDashboardData}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { resumen, distribucion, actividad } = data

  // Preparar datos para gráficos
  const proyectosPorDeptoData = distribucion.proyectosPorDepartamento.map(item => ({
    label: item.departamento,
    value: item._count?.id,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`
  }))

  const topDonantesData = distribucion.topDonantes.map(item => ({
    label: item.donante,
    value: item._sum?.monto || 0
  }))

  const topProveedoresData = distribucion.topProveedores?.map(item => ({
    label: item.proveedor,
    value: item._sum?.monto || 0
  }))

  // Preparar datos de actividad
  const donacionesActivity = actividad.donacionesRecientes?.map(item => ({
    id: item.id,
    type: 'donacion' as const,
    title: item.donante,
    subtitle: `Donación para ${item.proyecto.codigo}`,
    amount: item.monto,
    date: item.fecha,
    project: item.proyecto.nombre,
    renglon: item.renglon.nombre
  }))

  const ordenesActivity = actividad.ordenesRecientes?.map(item => ({
    id: item.id,
    type: 'orden' as const,
    title: `${item.numero} - ${item.proveedor}`,
    subtitle: `Orden de compra para ${item.proyecto.codigo}`,
    amount: item.monto,
    date: item.fecha,
    project: item.proyecto.nombre,
    renglon: item.renglon.nombre
  }))

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard - MVC Servir
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          Sistema de gestión de fondos para organizaciones no gubernamentales
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Proyectos"
          value={resumen.totalProyectos}
          subtitle={`${resumen.proyectosActivos} activos, ${resumen.proyectosCompletados} completados`}
          color="blue"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        
        <MetricCard
          title="Total Donado"
          value={formatCurrency(resumen.totalDonado)}
          subtitle={`${resumen.totalDonaciones} donaciones`}
          color="green"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
        />
        
        <MetricCard
          title="Total Gastado"
          value={formatCurrency(resumen.totalGastado)}
          subtitle={`${resumen.totalOrdenes} órdenes de compra`}
          color="red"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
          }
        />
        
        <MetricCard
          title="Saldo Disponible"
          value={formatCurrency(resumen.saldoDisponible)}
          subtitle={`${resumen.porcentajeEjecucion}% ejecutado`}
          color={resumen.saldoDisponible >= 0 ? 'green' : 'red'}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
      </div>

      {/* Gráficos y estadísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <StatsChart
          title="Proyectos por Departamento"
          data={proyectosPorDeptoData}
          type="pie"
        />
        
        <StatsChart
          title="Top 5 Donantes"
          data={topDonantesData}
          type="bar"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <StatsChart
          title="Top 5 Proveedores"
          data={topProveedoresData}
          type="bar"
        />
        
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Resumen de Actividad
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{resumen.totalRenglones}</div>
              <div className="text-sm text-gray-500">Renglones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{resumen.totalDonaciones}</div>
              <div className="text-sm text-gray-500">Donaciones</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{resumen.totalOrdenes}</div>
              <div className="text-sm text-gray-500">Órdenes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{resumen.porcentajeEjecucion}%</div>
              <div className="text-sm text-gray-500">Ejecutado</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actividad reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityList
          title="Donaciones Recientes"
          items={donacionesActivity}
          emptyMessage="No hay donaciones recientes"
        />
        
        <ActivityList
          title="Órdenes de Compra Recientes"
          items={ordenesActivity}
          emptyMessage="No hay órdenes de compra recientes"
        />
      </div>

      {/* Acciones rápidas */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Link
            href="/proyectos"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Ver Proyectos
          </Link>
          
          <Link
            href="/proyectos/nuevo"
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Proyecto
          </Link>
          
          <Link
            href="/donaciones/nueva"
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Nueva Donación
          </Link>
          
          <Link
            href="/ordenes-compra/nueva"
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
            Nueva Orden
          </Link>
          
          <Link
            href="/renglones/nuevo"
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            Nuevo Renglón
          </Link>
        </div>
      </div>
    </div>
  )
}

