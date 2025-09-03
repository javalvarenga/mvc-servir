import { NextApiRequest, NextApiResponse } from 'next'
import { Renglon } from '@/models/Renglon'

export class RenglonController {
  private renglonModel = new Renglon()

  async getAll(req: NextApiRequest, res: NextApiResponse) {
    try {
      const renglones = await this.renglonModel.getAll()
      res.status(200).json({ success: true, data: renglones })
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al obtener los renglones' })
    }
  }

  async getById(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query
      
      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ success: false, message: 'ID inválido' })
      }

      const renglon = await this.renglonModel.getById(Number(id))
      
      if (!renglon) {
        return res.status(404).json({ success: false, message: 'Renglón no encontrado' })
      }

      res.status(200).json({ success: true, data: renglon })
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al obtener el renglón' })
    }
  }

  async getByProyecto(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { proyectoId } = req.query
      
      if (!proyectoId || isNaN(Number(proyectoId))) {
        return res.status(400).json({ success: false, message: 'ID de proyecto inválido' })
      }

      const renglones = await this.renglonModel.getByProyecto(Number(proyectoId))
      res.status(200).json({ success: true, data: renglones })
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al obtener los renglones' })
    }
  }

  async create(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { nombre, proyectoId } = req.body

      if (!nombre || !proyectoId) {
        return res.status(400).json({ success: false, message: 'Campos requeridos faltantes' })
      }

      const renglon = await this.renglonModel.create({
        nombre,
        proyectoId: parseInt(proyectoId)
      })
      
      res.status(201).json({ success: true, data: renglon })
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al crear el renglón' })
    }
  }

  async update(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query
      const data = req.body

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ success: false, message: 'ID inválido' })
      }

      const renglon = await this.renglonModel.update(Number(id), data)
      
      res.status(200).json({ success: true, data: renglon })
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al actualizar el renglón' })
    }
  }

  async delete(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ success: false, message: 'ID inválido' })
      }

      await this.renglonModel.delete(Number(id))
      
      res.status(200).json({ success: true, message: 'Renglón eliminado' })
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al eliminar el renglón' })
    }
  }
}