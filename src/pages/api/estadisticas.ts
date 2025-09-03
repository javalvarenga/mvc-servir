import { NextApiRequest, NextApiResponse } from 'next'
import { executeQuery } from '../../lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método no permitido' })
  }

  try {
    const { tipo, proyectoId, renglonId } = req.query

    if (tipo === 'ejecucion-proyecto' && proyectoId) {
      // Calcular porcentaje de ejecución de fondos para un proyecto
      const [totalDonaciones, totalOrdenes] = await Promise.all([
        executeQuery('SELECT SUM(monto) as total FROM donaciones WHERE proyectoId = ?', [proyectoId]),
        executeQuery('SELECT SUM(monto) as total FROM ordenes_compra WHERE proyectoId = ?', [proyectoId])
      ])
      
      const totalDonacionesNum = parseFloat(totalDonaciones?.[0]?.total || 0)
      const totalOrdenesNum = parseFloat(totalOrdenes?.[0]?.total || 0)
      
      const porcentajeEjecucion = totalDonacionesNum > 0 
        ? Math.round((totalOrdenesNum * 100) / totalDonacionesNum * 100) / 100
        : 0

      res.status(200).json({
        success: true,
        data: {
          proyectoId: Number(proyectoId),
          totalDonaciones: totalDonacionesNum,
          totalEjecutado: totalOrdenesNum,
          porcentajeEjecucion
        }
      })
      return
    }

    if (tipo === 'disponibilidad-renglon' && renglonId) {
      // Calcular disponibilidad de fondos en un renglón
      const [totalDonaciones, totalOrdenes] = await Promise.all([
        executeQuery('SELECT SUM(monto) as total FROM donaciones WHERE renglonId = ?', [renglonId]),
        executeQuery('SELECT SUM(monto) as total FROM ordenes_compra WHERE renglonId = ?', [renglonId])
      ])
      
      const totalDonacionesNum = parseFloat(totalDonaciones?.[0]?.total || 0)
      const totalOrdenesNum = parseFloat(totalOrdenes?.[0]?.total || 0)
      const disponibilidad = totalDonacionesNum - totalOrdenesNum

      res.status(200).json({
        success: true,
        data: {
          renglonId: Number(renglonId),
          totalDonado: totalDonacionesNum,
          totalGastado: totalOrdenesNum,
          disponibilidad
        }
      })
      return
    }

    res.status(400).json({ 
      success: false, 
      message: 'Parámetros requeridos: tipo (ejecucion-proyecto|disponibilidad-renglon), proyectoId o renglonId' 
    })

  } catch (error) {
    console.error('Error en estadísticas:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    })
  }
}