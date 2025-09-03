import { executeQuery, executeUpdate } from '../lib/database'

export class Renglon {
  async getAll() {
    const query = `
      SELECT r.*, p.nombre as proyecto_nombre, p.codigo as proyecto_codigo
      FROM renglones r
      JOIN proyectos p ON r.proyectoId = p.id
      ORDER BY p.nombre, r.nombre
    `
    return await executeQuery(query)
  }

  async getById(id: number) {
    const query = `
      SELECT r.*, p.nombre as proyecto_nombre, p.codigo as proyecto_codigo
      FROM renglones r
      JOIN proyectos p ON r.proyectoId = p.id
      WHERE r.id = ?
    `
    const results = await executeQuery(query, [id])
    return results?.[0] || null
  }

  async getByProyecto(proyectoId: number) {
    const query = `
      SELECT r.*, 
             COALESCE(SUM(d.monto), 0) as totalDonado,
             COALESCE(SUM(oc.monto), 0) as totalGastado
      FROM renglones r
      LEFT JOIN donaciones d ON r.id = d.renglonId
      LEFT JOIN ordenes_compra oc ON r.id = oc.renglonId
      WHERE r.proyectoId = ?
      GROUP BY r.id
      ORDER BY r.nombre
    `
    return await executeQuery(query, [proyectoId])
  }

  async create(data: any) {
    const { nombre, proyectoId } = data
    
    const query = `
      INSERT INTO renglones (nombre, proyectoId)
      VALUES (?, ?)
    `
    const result = await executeUpdate(query, [nombre, proyectoId])
    return result.insertId
  }

  async update(id: number, data: any) {
    const { nombre, proyectoId } = data
    
    const query = `
      UPDATE renglones 
      SET nombre = ?, proyectoId = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    await executeUpdate(query, [nombre, proyectoId, id])
    return true
  }

  async delete(id: number) {
    const query = 'DELETE FROM renglones WHERE id = ?'
    await executeUpdate(query, [id])
    return true
  }

  async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(DISTINCT proyectoId) as proyectosConRenglones
      FROM renglones
    `
    const result = await executeQuery(query)
    return result?.[0] || {}
  }

  async getRenglonWithStats(id: number) {
    const query = `
      SELECT r.*, p.nombre as proyecto_nombre, p.codigo as proyecto_codigo,
             COALESCE(SUM(d.monto), 0) as totalDonado,
             COALESCE(SUM(oc.monto), 0) as totalGastado,
             (COALESCE(SUM(d.monto), 0) - COALESCE(SUM(oc.monto), 0)) as disponibilidad
      FROM renglones r
      JOIN proyectos p ON r.proyectoId = p.id
      LEFT JOIN donaciones d ON r.id = d.renglonId
      LEFT JOIN ordenes_compra oc ON r.id = oc.renglonId
      WHERE r.id = ?
      GROUP BY r.id
    `
    const results = await executeQuery(query, [id])
    return results?.[0] || null
  }
}