import { NextApiRequest, NextApiResponse } from 'next'
import { Proyecto } from '../../models/Proyecto'
import { proyectoController } from '../../controllers/proyectoController'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query } = req
  const { id } = query

  try {
    switch (method) {
      case 'GET':
        if (id) {
          return await proyectoController.getById(req, res)
        } else {
          return await proyectoController.getAll(req, res)
        }

      case 'POST':
        return await proyectoController.create(req, res)

      case 'PUT':
        if (!id) {
          return res.status(400).json({ success: false, message: 'ID de proyecto requerido' })
        }
        return await proyectoController.update(req, res)

      case 'DELETE':
        if (!id) {
          return res.status(400).json({ success: false, message: 'ID de proyecto requerido' })
        }
        return await proyectoController.delete(req, res)

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
        return res.status(405).json({ success: false, message: 'Método no permitido' })
    }
  } catch (error) {
    console.error('Error en API proyectos:', error)
    return res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    })
  }
}