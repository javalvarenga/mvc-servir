import { NextApiRequest, NextApiResponse } from 'next'
import { Donacion } from '../models/Donacion'

export class DonacionController {
  private donacionModel = new Donacion()

  async getAll(req: NextApiRequest, res: NextApiResponse) {
    try {
      const donaciones = await this.donacionModel.getAll()
      res.status(200).json({ success: true, data: donaciones })
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al obtener las donaciones' })
    }
  }

  async getById(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query
      
      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ success: false, message: 'ID inválido' })
      }

      const donacion = await this.donacionModel.getById(Number(id))
      
      if (!donacion) {
        return res.status(404).json({ success: false, message: 'Donación no encontrada' })
      }

      res.status(200).json({ success: true, data: donacion })
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al obtener la donación' })
    }
  }

  async create(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { monto, fecha, donante, proyectoId, renglonId } = req.body

      if (!monto || !donante || !proyectoId || !renglonId) {
        return res.status(400).json({ success: false, message: 'Campos requeridos faltantes' })
      }

      const donacion = await this.donacionModel.create({
        monto: parseFloat(monto),
        fecha: fecha ? new Date(fecha) : undefined,
        donante,
        proyectoId: parseInt(proyectoId),
        renglonId: parseInt(renglonId)
      })
      
      res.status(201).json({ success: true, data: donacion })
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al crear la donación' })
    }
  }

  async update(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query
      const data = req.body

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ success: false, message: 'ID inválido' })
      }

      const donacion = await this.donacionModel.update(Number(id), data)
      
      res.status(200).json({ success: true, data: donacion })
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al actualizar la donación' })
    }
  }

  async delete(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({ success: false, message: 'ID inválido' })
      }

      await this.donacionModel.delete(Number(id))
      
      res.status(200).json({ success: true, message: 'Donación eliminada' })
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error al eliminar la donación' })
    }
  }
}