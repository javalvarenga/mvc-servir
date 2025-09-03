import { executeQuery, executeUpdate } from '../lib/database'

export class Proyecto {
  async getAll() {
    const query = `
      SELECT p.*, 
             COUNT(DISTINCT r.id) as totalRenglones,
             COUNT(DISTINCT d.id) as totalDonaciones,
             COUNT(DISTINCT oc.id) as totalOrdenes
      FROM proyectos p
      LEFT JOIN renglones r ON p.id = r.proyectoId
      LEFT JOIN donaciones d ON p.id = d.proyectoId
      LEFT JOIN ordenes_compra oc ON p.id = oc.proyectoId
      GROUP BY p.id
      ORDER BY p.createdAt DESC
    `
    return await executeQuery(query)
  }

  async getById(id: number) {
    const query = `
      SELECT p.*, 
             COUNT(DISTINCT r.id) as totalRenglones,
             COUNT(DISTINCT d.id) as totalDonaciones,
             COUNT(DISTINCT oc.id) as totalOrdenes
      FROM proyectos p
      LEFT JOIN renglones r ON p.id = r.proyectoId
      LEFT JOIN donaciones d ON p.id = d.proyectoId
      LEFT JOIN ordenes_compra oc ON p.id = oc.proyectoId
      WHERE p.id = ?
      GROUP BY p.id
    `
    const results = await executeQuery(query, [id])
    return results[0] || null
  }

  async getByIdWithRelations(id: number) {
    const query = `
      SELECT p.*, 
             r.id as renglon_id, r.nombre as renglon_nombre,
             d.id as donacion_id, d.monto as donacion_monto, d.fecha as donacion_fecha, d.donante,
             oc.id as orden_id, oc.numero as orden_numero, oc.proveedor, oc.monto as orden_monto, oc.fecha as orden_fecha
      FROM proyectos p
      LEFT JOIN renglones r ON p.id = r.proyectoId
      LEFT JOIN donaciones d ON p.id = d.proyectoId
      LEFT JOIN ordenes_compra oc ON p.id = oc.proyectoId
      WHERE p.id = ?
      ORDER BY r.nombre, d.fecha DESC, oc.fecha DESC
    `
    const results = await executeQuery(query, [id])
    
    if (!results.length) return null

    const proyecto: any = {
      id: results[0]?.id,
      codigo: results[0]?.codigo,
      nombre: results[0]?.nombre,
      municipio: results[0]?.municipio,
      departamento: results[0]?.departamento,
      fechaInicio: results[0]?.fechaInicio,
      fechaFin: results[0]?.fechaFin,
      estado: results[0]?.estado,
      createdAt: results[0]?.createdAt,
      updatedAt: results[0]?.updatedAt,
      renglones: [],
      donaciones: [],
      ordenesCompra: []
    }

    // Procesar resultados para agrupar relaciones
    const renglonesMap = new Map()
    const donacionesMap = new Map()
    const ordenesMap = new Map()

    results.forEach(row => {
      if (row?.renglon_id && !renglonesMap.has(row.renglon_id)) {
        renglonesMap.set(row.renglon_id, {
          id: row.renglon_id,
          nombre: row.renglon_nombre,
          proyectoId: row.id,
          donaciones: [],
          ordenesCompra: []
        })
      }

      if (row?.donacion_id && !donacionesMap.has(row.donacion_id)) {
        donacionesMap.set(row.donacion_id, {
          id: row.donacion_id,
          monto: parseFloat(row.donacion_monto || 0),
          fecha: row.donacion_fecha,
          donante: row.donante,
          proyectoId: row.id,
          renglonId: row.renglon_id
        })
      }

      if (row?.orden_id && !ordenesMap.has(row.orden_id)) {
        ordenesMap.set(row.orden_id, {
          id: row.orden_id,
          numero: row.orden_numero,
          proveedor: row.proveedor,
          monto: parseFloat(row.orden_monto || 0),
          fecha: row.orden_fecha,
          proyectoId: row.id,
          renglonId: row.renglon_id
        })
      }
    })

    proyecto.renglones = Array.from(renglonesMap.values())
    proyecto.donaciones = Array.from(donacionesMap.values())
    proyecto.ordenesCompra = Array.from(ordenesMap.values())

    return proyecto
  }

  async create(data: any) {
    const { nombre, municipio, departamento, fechaInicio, fechaFin, estado } = data
    
    // Generar código automáticamente
    const codigo = await this.generateCodigo()
    
    const query = `
      INSERT INTO proyectos (codigo, nombre, municipio, departamento, fechaInicio, fechaFin, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    const result = await executeUpdate(query, [codigo, nombre, municipio, departamento, fechaInicio, fechaFin, estado])
    return result.insertId
  }

  async update(id: number, data: any) {
    const { nombre, municipio, departamento, fechaInicio, fechaFin, estado } = data
    
    const query = `
      UPDATE proyectos 
      SET nombre = ?, municipio = ?, departamento = ?, fechaInicio = ?, fechaFin = ?, estado = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    await executeUpdate(query, [nombre, municipio, departamento, fechaInicio, fechaFin, estado, id])
    return true
  }

  async delete(id: number) {
    const query = 'DELETE FROM proyectos WHERE id = ?'
    await executeUpdate(query, [id])
    return true
  }

  private async generateCodigo() {
    const query = 'SELECT COUNT(*) as count FROM proyectos'
    const result = await executeQuery(query)
    const count = (result[0]?.count || 0) + 1
    return `P-${count.toString().padStart(4, '0')}`
  }

  async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN estado = 'activo' THEN 1 END) as activos,
        COUNT(CASE WHEN estado = 'completado' THEN 1 END) as completados,
        COUNT(CASE WHEN estado = 'pausado' THEN 1 END) as pausados
      FROM proyectos
    `
    const result = await executeQuery(query)
    return result[0] || {}
  }
}