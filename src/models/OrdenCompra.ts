import { executeQuery, executeUpdate } from '../lib/database'

export class OrdenCompra {
  async getAll() {
    const query = `
      SELECT oc.*, p.nombre as proyecto_nombre, r.nombre as renglon_nombre
      FROM ordenes_compra oc
      JOIN proyectos p ON oc.proyectoId = p.id
      JOIN renglones r ON oc.renglonId = r.id
      ORDER BY oc.fecha DESC
    `
    return await executeQuery(query)
  }

  async getById(id: number) {
    const query = `
      SELECT oc.*, p.nombre as proyecto_nombre, r.nombre as renglon_nombre
      FROM ordenes_compra oc
      JOIN proyectos p ON oc.proyectoId = p.id
      JOIN renglones r ON oc.renglonId = r.id
      WHERE oc.id = ?
    `
    const results = await executeQuery(query, [id])
    return results?.[0] || null
  }

  async getByProyecto(proyectoId: number) {
    const query = `
      SELECT oc.*, r.nombre as renglon_nombre
      FROM ordenes_compra oc
      JOIN renglones r ON oc.renglonId = r.id
      WHERE oc.proyectoId = ?
      ORDER BY oc.fecha DESC
    `
    return await executeQuery(query, [proyectoId])
  }

  async getByRenglon(renglonId: number) {
    const query = `
      SELECT oc.*, p.nombre as proyecto_nombre
      FROM ordenes_compra oc
      JOIN proyectos p ON oc.proyectoId = p.id
      WHERE oc.renglonId = ?
      ORDER BY oc.fecha DESC
    `
    return await executeQuery(query, [renglonId])
  }

  async create(data: any) {
    const { numero, proveedor, monto, fecha, proyectoId, renglonId } = data
    
    const query = `
      INSERT INTO ordenes_compra (numero, proveedor, monto, fecha, proyectoId, renglonId)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    const result = await executeUpdate(query, [numero, proveedor, monto, fecha, proyectoId, renglonId])
    return result.insertId
  }

  async update(id: number, data: any) {
    const { numero, proveedor, monto, fecha, proyectoId, renglonId } = data
    
    const query = `
      UPDATE ordenes_compra 
      SET numero = ?, proveedor = ?, monto = ?, fecha = ?, proyectoId = ?, renglonId = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `
    await executeUpdate(query, [numero, proveedor, monto, fecha, proyectoId, renglonId, id])
    return true
  }

  async delete(id: number) {
    const query = 'DELETE FROM ordenes_compra WHERE id = ?'
    await executeUpdate(query, [id])
    return true
  }

  async getTotalByProyecto(proyectoId: number) {
    const query = 'SELECT SUM(monto) as total FROM ordenes_compra WHERE proyectoId = ?'
    const result = await executeQuery(query, [proyectoId])
    return result?.[0]?.total || 0
  }

  async getTotalByRenglon(renglonId: number) {
    const query = 'SELECT SUM(monto) as total FROM ordenes_compra WHERE renglonId = ?'
    const result = await executeQuery(query, [renglonId])
    return result?.[0]?.total || 0
  }

  async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total,
        SUM(monto) as totalMonto,
        AVG(monto) as promedioMonto,
        COUNT(DISTINCT proveedor) as totalProveedores
      FROM ordenes_compra
    `
    const result = await executeQuery(query)
    return result?.[0] || {}
  }

  async getTopProveedores(limit: number = 5) {
    const query = `
      SELECT proveedor, SUM(monto) as total, COUNT(*) as cantidad
      FROM ordenes_compra
      GROUP BY proveedor
      ORDER BY total DESC
      LIMIT ?
    `
    return await executeQuery(query, [limit])
  }
}