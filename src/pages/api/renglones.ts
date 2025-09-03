import { NextApiRequest, NextApiResponse } from 'next'
import { RenglonController } from '@/controllers/renglonController'

const controller = new RenglonController()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  switch (method) {
    case 'GET':
      if (req.query.id) {
        await controller.getById(req, res)
      } else if (req.query.proyectoId) {
        await controller.getByProyecto(req, res)
      } else {
        await controller.getAll(req, res)
      }
      break

    case 'POST':
      await controller.create(req, res)
      break

    case 'PUT':
      await controller.update(req, res)
      break

    case 'DELETE':
      await controller.delete(req, res)
      break

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
      res.status(405).json({ success: false, message: `Método ${method} no permitido` })
      break
  }
}