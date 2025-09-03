import { NextApiRequest, NextApiResponse } from 'next'
import { executeQuery, testDatabaseConnection } from '../../lib/database'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método no permitido' })
  }

  try {
    // Verificar conexión a la base de datos
    const isConnected = await testDatabaseConnection()
    if (!isConnected) {
      return res.status(500).json({ success: false, message: 'Error de conexión a la base de datos' })
    }

    // Obtener estadísticas generales
    const [
      totalProyectos,
      totalRenglones,
      totalDonaciones,
      totalOrdenes,
      proyectosActivos,
      proyectosCompletados,
      totalDonado,
      totalGastado,
      topDonantes,
      topProveedores,
      distribucionProyectos,
      donacionesRecientes,
      ordenesRecientes,
      actividadMensual
    ] = await Promise.all([
      // Total de proyectos
      executeQuery('SELECT COUNT(*) as total FROM proyectos'),
      
      // Total de renglones
      executeQuery('SELECT COUNT(*) as total FROM renglones'),
      
      // Total de donaciones
      executeQuery('SELECT COUNT(*) as total FROM donaciones'),
      
      // Total de órdenes de compra
      executeQuery('SELECT COUNT(*) as total FROM ordenes_compra'),
      
      // Proyectos activos
      executeQuery("SELECT COUNT(*) as total FROM proyectos WHERE estado = 'activo'"),
      
      // Proyectos completados
      executeQuery("SELECT COUNT(*) as total FROM proyectos WHERE estado = 'completado'"),
      
      // Total donado
      executeQuery('SELECT SUM(monto) as total FROM donaciones'),
      
      // Total gastado
      executeQuery('SELECT SUM(monto) as total FROM ordenes_compra'),
      
      // Top donantes
      executeQuery(`
        SELECT donante, SUM(monto) as total, COUNT(*) as cantidad
        FROM donaciones
        GROUP BY donante
        ORDER BY total DESC
        LIMIT 5
      `),
      
      // Top proveedores
      executeQuery(`
        SELECT proveedor, SUM(monto) as total, COUNT(*) as cantidad
        FROM ordenes_compra
        GROUP BY proveedor
        ORDER BY total DESC
        LIMIT 5
      `),
      
      // Distribución por departamento
      executeQuery(`
        SELECT departamento, COUNT(*) as cantidad
        FROM proyectos
        GROUP BY departamento
        ORDER BY cantidad DESC
      `),
      
      // Donaciones recientes
      executeQuery(`
        SELECT d.id, d.monto, d.fecha, d.donante, d.proyectoId, d.renglonId,
               p.codigo as proyecto_codigo, p.nombre as proyecto_nombre,
               r.nombre as renglon_nombre
        FROM donaciones d
        JOIN proyectos p ON d.proyectoId = p.id
        JOIN renglones r ON d.renglonId = r.id
        ORDER BY d.fecha DESC
        LIMIT 10
      `),
      
      // Órdenes recientes
      executeQuery(`
        SELECT oc.id, oc.numero, oc.proveedor, oc.monto, oc.fecha, oc.proyectoId, oc.renglonId,
               p.codigo as proyecto_codigo, p.nombre as proyecto_nombre,
               r.nombre as renglon_nombre
        FROM ordenes_compra oc
        JOIN proyectos p ON oc.proyectoId = p.id
        JOIN renglones r ON oc.renglonId = r.id
        ORDER BY oc.fecha DESC
        LIMIT 10
      `),
      
      // Actividad mensual (últimos 6 meses)
      executeQuery(`
        SELECT 
          DATE_FORMAT(fecha, '%Y-%m') as mes,
          'donacion' as tipo,
          COUNT(*) as cantidad,
          SUM(monto) as monto
        FROM donaciones
        WHERE fecha >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(fecha, '%Y-%m')
        
        UNION ALL
        
        SELECT 
          DATE_FORMAT(fecha, '%Y-%m') as mes,
          'orden' as tipo,
          COUNT(*) as cantidad,
          SUM(monto) as monto
        FROM ordenes_compra
        WHERE fecha >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(fecha, '%Y-%m')
        
        ORDER BY mes DESC, tipo
      `)
    ])

    // Calcular saldo disponible
    const totalDonadoNum = parseFloat(totalDonado?.[0]?.total || 0)
    const totalGastadoNum = parseFloat(totalGastado?.[0]?.total || 0)
    const saldoDisponible = totalDonadoNum - totalGastadoNum
    
    // Calcular porcentaje de ejecución general
    const porcentajeEjecucion = totalDonadoNum > 0
      ? Math.round((totalGastadoNum * 100 / totalDonadoNum) * 100) / 100
      : 0

    // Procesar actividad mensual
    const actividadPorMes: any = {}
    actividadMensual.forEach((item: any) => {
      if (!actividadPorMes[item?.mes]) {
        actividadPorMes[item?.mes] = { mes: item?.mes, donaciones: 0, ordenes: 0 }
      }
      if (item?.tipo === 'donacion') {
        actividadPorMes[item?.mes].donaciones = parseInt(item?.cantidad || 0)
      } else {
        actividadPorMes[item?.mes].ordenes = parseInt(item?.cantidad || 0)
      }
    })

    // Procesar datos de distribución para que coincidan con la estructura esperada
    const proyectosPorDepartamento = distribucionProyectos?.map((item: any) => ({
      departamento: item.departamento,
      _count: { id: item.cantidad }
    })) || []

    const topDonantesFormatted = topDonantes?.map((item: any) => ({
      donante: item.donante,
      _sum: { monto: parseFloat(item.total || 0) },
      _count: { id: item.cantidad }
    })) || []

    const topProveedoresFormatted = topProveedores?.map((item: any) => ({
      proveedor: item.proveedor,
      _sum: { monto: parseFloat(item.total || 0) },
      _count: { id: item.cantidad }
    })) || []

    // Procesar donaciones recientes
    const donacionesRecientesFormatted = donacionesRecientes?.map((item: any) => ({
      id: item.id,
      monto: parseFloat(item.monto || 0),
      fecha: item.fecha,
      donante: item.donante,
      proyecto: {
        codigo: item.proyecto_codigo,
        nombre: item.proyecto_nombre
      },
      renglon: {
        nombre: item.renglon_nombre
      }
    })) || []

    // Procesar órdenes recientes
    const ordenesRecientesFormatted = ordenesRecientes?.map((item: any) => ({
      id: item.id,
      numero: item.numero,
      proveedor: item.proveedor,
      monto: parseFloat(item.monto || 0),
      fecha: item.fecha,
      proyecto: {
        codigo: item.proyecto_codigo,
        nombre: item.proyecto_nombre
      },
      renglon: {
        nombre: item.renglon_nombre
      }
    })) || []

    res.status(200).json({
      success: true,
      data: {
        resumen: {
          totalProyectos: totalProyectos?.[0]?.total || 0,
          totalRenglones: totalRenglones?.[0]?.total || 0,
          totalDonaciones: totalDonaciones?.[0]?.total || 0,
          totalOrdenes: totalOrdenes?.[0]?.total || 0,
          proyectosActivos: proyectosActivos?.[0]?.total || 0,
          proyectosCompletados: proyectosCompletados?.[0]?.total || 0,
          totalDonado: totalDonadoNum,
          totalGastado: totalGastadoNum,
          saldoDisponible,
          porcentajeEjecucion
        },
        distribucion: {
          proyectosPorDepartamento,
          topDonantes: topDonantesFormatted,
          topProveedores: topProveedoresFormatted
        },
        actividad: {
          donacionesRecientes: donacionesRecientesFormatted,
          ordenesRecientes: ordenesRecientesFormatted,
          mensual: Object.values(actividadPorMes)
        }
      }
    })

  } catch (error) {
    console.error('Error en dashboard:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    })
  }
}