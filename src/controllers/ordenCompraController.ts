import { NextApiRequest, NextApiResponse } from 'next'
import { OrdenCompra } from '@/models/OrdenCompra'

export class OrdenCompraController {
  private ordenModel = new OrdenCompra()

  async getAll(req: NextApiRequest, res: NextApiResponse) {
    try {
      const ordenes = await this.ordenModel.getAll()
      res.status(200).json({ success: true, data: ordenes })
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al obtener las órdenes' })
    }
  }

  async getById(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query
      
      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ success: false, message: 'ID inválido' })
      }

      const orden = await this.ordenModel.getById(Number(id))
      
      if (!orden) {
        return res.status(404).json({ success: false, message: 'Orden no encontrada' })
      }

      res.status(200).json({ success: true, data: orden })
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al obtener la orden' })
    }
  }

  async create(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { numero, proveedor, monto, fecha, proyectoId, renglonId } = req.body

      if (!proveedor || !monto || !proyectoId || !renglonId) {
        return res.status(400).json({ success: false, message: 'Campos requeridos faltantes' })
      }

      const orden = await this.ordenModel.create({
        numero: numero || null,
        proveedor,
        monto: parseFloat(monto),
        fecha: fecha ? new Date(fecha) : null,
        proyectoId: parseInt(proyectoId),
        renglonId: parseInt(renglonId)
      })
      
      res.status(201).json({ success: true, data: orden })
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al crear la orden' })
    }
  }

  async update(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query
      const { numero, proveedor, monto, fecha, proyectoId, renglonId } = req.body

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ success: false, message: 'ID inválido' })
      }

      const orden = await this.ordenModel.update(Number(id), {
        numero: numero || null,
        proveedor,
        monto: parseFloat(monto),
        fecha: fecha ? new Date(fecha) : null,
        proyectoId: parseInt(proyectoId),
        renglonId: parseInt(renglonId)
      })
      
      res.status(200).json({ success: true, data: orden })
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al actualizar la orden' })
    }
  }

  async delete(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ success: false, message: 'ID inválido' })
      }

      await this.ordenModel.delete(Number(id))
      
      res.status(200).json({ success: true, message: 'Orden eliminada' })
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al eliminar la orden' })
    }
  }
}