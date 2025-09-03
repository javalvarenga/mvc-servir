"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSweetAlert } from "../../hooks/useSweetAlert";

interface Proyecto {
  id: number;
  codigo: string;
  nombre: string;
  municipio: string;
  departamento: string;
  fechaInicio: string;
  fechaFin?: string;
  estado: string;
  createdAt: string;
  updatedAt: string;
  renglones?: Renglon[];
  donaciones?: Donacion[];
  ordenesCompra?: OrdenCompra[];
}

interface Renglon {
  id: number;
  nombre: string;
  proyectoId: number;
}

interface Donacion {
  id: number;
  monto: number;
  fecha: string;
  donante: string;
  proyectoId: number;
  renglonId: number;
}

interface OrdenCompra {
  id: number;
  numero: string;
  proveedor: string;
  monto: number;
  fecha: string;
  proyectoId: number;
  renglonId: number;
}

export default function ProyectosPage() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { confirmDelete, showSuccess, showError, showLoading, closeLoading } =
    useSweetAlert();

  useEffect(() => {
    fetchProyectos();
  }, []);

  const fetchProyectos = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/proyectos");
      const data = await response.json();

      if (data.success) {
        setProyectos(data.data);
      } else {
        setError(data.message || "Error al cargar los proyectos");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "activo":
        return "bg-green-100 text-green-800";
      case "completado":
        return "bg-blue-100 text-blue-800";
      case "pausado":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleDelete = async (id: number, proyectoNombre: string) => {
    const confirmed = await confirmDelete(
      "¿Eliminar proyecto?",
      `¿Estás seguro de que quieres eliminar el proyecto "${proyectoNombre}"? Esta acción no se puede deshacer y eliminará todos los renglones, donaciones y órdenes asociadas.`,
      "proyecto"
    );

    if (!confirmed) return;

    try {
      showLoading(
        "Eliminando...",
        "Por favor espera mientras eliminamos el proyecto"
      );

      const response = await fetch(`/api/proyectos?id=${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      closeLoading();

      if (data.success) {
        showSuccess(
          "¡Eliminado!",
          "El proyecto ha sido eliminado exitosamente"
        );
        // Recargar la lista de proyectos
        fetchProyectos();
      } else {
        showError("Error", data.message || "Error al eliminar el proyecto");
      }
    } catch (err) {
      closeLoading();
      showError("Error de conexión", "No se pudo conectar con el servidor");
    }
  };

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={fetchProyectos}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Proyectos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Lista de todos los proyectos del sistema
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <Link
            href="/proyectos/nuevo"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            Nuevo Proyecto
          </Link>
        </div>
      </div>

      {proyectos.length === 0 ? (
        <div className="mt-8 text-center">
          <div className="bg-white shadow rounded-lg p-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay proyectos
            </h3>
            <p className="text-gray-500 mb-4">
              Comienza creando tu primer proyecto
            </p>
            <Link
              href="/proyectos/nuevo"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
            >
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Crear Proyecto
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 flow-root">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Proyecto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Inicio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha Fin
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {proyectos?.map((proyecto) => (
                      <tr key={proyecto.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {proyecto.codigo} - {proyecto.nombre}
                              </div>
                              <div className="text-sm text-gray-500">
                                {proyecto.municipio}, {proyecto.departamento}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(
                              proyecto.estado
                            )}`}
                          >
                            {proyecto.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(proyecto.fechaInicio)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {proyecto.fechaFin
                            ? formatDate(proyecto.fechaFin)
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/proyectos/${proyecto.id}`}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Ver Detalles
                          </Link>
                          <Link
                            href={`/proyectos/${proyecto.id}/editar`}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Editar
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete(proyecto.id, proyecto.nombre)
                            }
                            className="text-red-600 hover:text-red-900"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
