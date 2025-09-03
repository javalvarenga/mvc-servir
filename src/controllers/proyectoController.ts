import { NextApiRequest, NextApiResponse } from 'next'
import { Proyecto } from '../models/Proyecto'

const proyectoModel = new Proyecto()

export const proyectoController = {
  async getAll(req: NextApiRequest, res: NextApiResponse) {
    try {
      const proyectos = await proyectoModel.getAll()
      
      res.status(200).json({
        success: true,
        data: proyectos
      })
    } catch (error) {
      console.error('Error obteniendo proyectos:', error)
      res.status(500).json({
        success: false,
        message: 'Error al obtener proyectos',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      })
    }
  },

  async getById(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID de proyecto requerido'
        })
      }

      const proyecto = await proyectoModel.getByIdWithRelations(Number(id))
      
      if (!proyecto) {
        return res.status(404).json({
          success: false,
          message: 'Proyecto no encontrado'
        })
      }

      res.status(200).json({
        success: true,
        data: proyecto
      })
    } catch (error) {
      console.error('Error obteniendo proyecto:', error)
      res.status(500).json({
        success: false,
        message: 'Error al obtener proyecto',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      })
    }
  },

  async create(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { nombre, municipio, departamento, fechaInicio, fechaFin, estado } = req.body

      // Validaciones básicas
      if (!nombre || !municipio || !departamento) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, municipio y departamento son requeridos'
        })
      }

      const proyectoId = await proyectoModel.create({
        nombre,
        municipio,
        departamento,
        fechaInicio: fechaInicio || new Date(),
        fechaFin: fechaFin || null,
        estado: estado || 'activo'
      })

      res.status(201).json({
        success: true,
        message: 'Proyecto creado exitosamente',
        data: { id: proyectoId }
      })
    } catch (error) {
      console.error('Error creando proyecto:', error)
      res.status(500).json({
        success: false,
        message: 'Error al crear proyecto',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      })
    }
  },

  async update(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query
      const { nombre, municipio, departamento, fechaInicio, fechaFin, estado } = req.body

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID de proyecto requerido'
        })
      }

      // Validaciones básicas
      if (!nombre || !municipio || !departamento) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, municipio y departamento son requeridos'
        })
      }

      await proyectoModel.update(Number(id), {
        nombre,
        municipio,
        departamento,
        fechaInicio,
        fechaFin,
        estado
      })

      res.status(200).json({
        success: true,
        message: 'Proyecto actualizado exitosamente'
      })
    } catch (error) {
      console.error('Error actualizando proyecto:', error)
      res.status(500).json({
        success: false,
        message: 'Error al actualizar proyecto',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      })
    }
  },

  async delete(req: NextApiRequest, res: NextApiResponse) {
    try {
      const { id } = req.query

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID de proyecto requerido'
        })
      }

      await proyectoModel.delete(Number(id))

      res.status(200).json({
        success: true,
        message: 'Proyecto eliminado exitosamente'
      })
    } catch (error) {
      console.error('Error eliminando proyecto:', error)
      res.status(500).json({
        success: false,
        message: 'Error al eliminar proyecto',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      })
    }
  }
}