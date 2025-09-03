import { executeQuery, executeUpdate } from '../lib/database'

export class Donacion {
  async getAll() {
    const query = `
      SELECT d.*, p.nombre as proyecto_nombre, r.nombre as renglon_nombre
      FROM donaciones d
      JOIN proyectos p ON d.proyectoId = p.id
      JOIN renglones r ON d.renglonId = r.id
      ORDER BY d.fecha DESC
    `
    return await executeQuery(query)
  }

  async getById(id: number) {
    const query = `
      SELECT d.*, p.nombre as proyecto_nombre, r.nombre as renglon_nombre
      FROM donaciones d
      JOIN proyectos p ON d.proyectoId = p.id
      JOIN renglones r ON d.renglonId = r.id
      WHERE d.id = ?
    `
    const results = await executeQuery(query, [id])
    return results?.[0] || null
  }

  async getByProyecto(proyectoId: number) {
    const query = `
      SELECT d.*, r.nombre as renglon_nombre
      FROM donaciones d
      JOIN renglones r ON d.renglonId = r.id
      WHERE d.proyectoId = ?
      ORDER BY d.fecha DESC
    `
    return await executeQuery(query, [proyectoId])
  }

  async getByRenglon(renglonId: number) {
    const query = `
      SELECT d.*, p.nombre as proyecto_nombre
      FROM donaciones d
      JOIN proyectos p ON d.proyectoId = p.id
      WHERE d.renglonId = ?
      ORDER BY d.fecha DESC
    `
    return await executeQuery(query, [renglonId])
  }

  async create(data: any) {
    const { monto, fecha, donante, proyectoId, renglonId } = data
    
    const query = `
      INSERT INTO donaciones (monto, fecha, donante, proyectoId, renglonId)
      VALUES (?, ?, ?, ?, ?)
    `
    const result = await executeUpdate(query, [monto, fecha, donante, proyectoId, renglonId])
    return result.insertId
  }

  async update(id: number, data: any) {
    const { monto, fecha, donante, proyectoId, renglonId } = data
    
    const query = `
      UPDATE donaciones 
      SET monto = ?, fecha = ?, donante = ?, proyectoId = ?, renglonId = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    await executeUpdate(query, [monto, fecha, donante, proyectoId, renglonId, id])
    return true
  }

  async delete(id: number) {
    const query = 'DELETE FROM donaciones WHERE id = ?'
    await executeUpdate(query, [id])
    return true
  }

  async getTotalByProyecto(proyectoId: number) {
    const query = 'SELECT SUM(monto) as total FROM donaciones WHERE proyectoId = ?'
    const result = await executeQuery(query, [proyectoId])
    return result?.[0]?.total || 0
  }

  async getTotalByRenglon(renglonId: number) {
    const query = 'SELECT SUM(monto) as total FROM donaciones WHERE renglonId = ?'
    const result = await executeQuery(query, [renglonId])
    return result?.[0]?.total || 0
  }

  async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(monto) as totalMonto,
        AVG(monto) as promedioMonto,
        COUNT(DISTINCT donante) as totalDonantes
      FROM donaciones
    `
    const result = await executeQuery(query)
    return result?.[0] || {}
  }

  async getTopDonantes(limit: number = 5) {
    const query = `
      SELECT donante, SUM(monto) as total, COUNT(*) as cantidad
      FROM donaciones
      GROUP BY donante
      ORDER BY total DESC
      LIMIT ?
    `
    return await executeQuery(query, [limit])
  }
}