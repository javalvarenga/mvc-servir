"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSweetAlert } from "../../../hooks/useSweetAlert";
import { formatCurrency } from "../../../utils";
import RenglonForm from "../../../components/RenglonForm";
import DonacionForm from "../../../components/DonacionForm";
import OrdenCompraForm from "../../../components/OrdenCompraForm";

interface Proyecto {
  id: number;
  codigo: string;
  nombre: string;
  municipio: string;
  departamento: string;
  fechaInicio: string;
  fechaFin?: string;
  estado: string;
  renglones: Renglon[];
  donaciones: Donacion[];
  ordenesCompra: OrdenCompra[];
}

interface Renglon {
  id: number;
  nombre: string;
  proyectoId: number;
  donaciones: Donacion[];
  ordenesCompra: OrdenCompra[];
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

export default function ProyectoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "renglones" | "donaciones" | "ordenes" | "estadisticas"
  >("renglones");
  const { confirmDelete, showSuccess, showError, showLoading, closeLoading } =
    useSweetAlert();

  // Estados para formularios de edición
  const [editForm, setEditForm] = useState({
    isOpen: false,
    type: '' as 'renglon' | 'donacion' | 'orden',
    itemId: 0,
    initialData: null as any
  });

  const fetchProyecto = useCallback(async () => {
    if (!params?.id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/proyectos?id=${params.id}`);
      const data = await response.json();

      if (data.success) {
        setProyecto(data.data);
      } else {
        setError(data.message || "Error al cargar el proyecto");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, [params?.id]);

  useEffect(() => {
    if (params?.id) {
      fetchProyecto();
    }
  }, [params?.id, fetchProyecto]);

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

  const calculateRenglonStats = (renglon: Renglon) => {
    const totalDonado = renglon.donaciones?.reduce(
      (sum, d) => sum + d.monto,
      0
    );
    const totalGastado = renglon.ordenesCompra?.reduce(
      (sum, o) => sum + o.monto,
      0
    );
    const disponibilidad = totalDonado - totalGastado;

    return { totalDonado, totalGastado, disponibilidad };
  };

  // Funciones para manejar formularios de edición
  const openEditForm = (type: 'renglon' | 'donacion' | 'orden', itemId: number, initialData: any) => {
    setEditForm({
      isOpen: true,
      type,
      itemId,
      initialData
    });
  };

  const closeEditForm = () => {
    setEditForm({
      isOpen: false,
      type: '' as 'renglon' | 'donacion' | 'orden',
      itemId: 0,
      initialData: null
    });
  };

  // Función para manejar el cierre del formulario de edición
  const handleEditFormClose = () => {
    closeEditForm();
    fetchProyecto(); // Recargar datos después de editar
  };

  const handleDeleteRenglon = async (
    renglonId: number,
    renglonNombre: string
  ) => {
    const confirmed = await confirmDelete(
      "¿Eliminar renglón?",
      `¿Estás seguro de que quieres eliminar el renglón "${renglonNombre}"? Esta acción no se puede deshacer y eliminará todas las donaciones y órdenes asociadas.`,
      "renglón"
    );

    if (!confirmed) return;

    try {
      showLoading(
        "Eliminando...",
        "Por favor espera mientras eliminamos el renglón"
      );

      const response = await fetch(`/api/renglones?id=${renglonId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      closeLoading();

      if (data.success) {
        showSuccess("¡Eliminado!", "El renglón ha sido eliminado exitosamente");
        // Recargar el proyecto
        fetchProyecto();
      } else {
        showError("Error", data.message || "Error al eliminar el renglón");
      }
    } catch (err) {
      closeLoading();
      showError("Error de conexión", "No se pudo conectar con el servidor");
    }
  };

  const handleDeleteDonacion = async (
    donacionId: number,
    donante: string,
    monto: number
  ) => {
    const confirmed = await confirmDelete(
      "¿Eliminar donación?",
      `¿Estás seguro de que quieres eliminar la donación de "${donante}" por Q${monto.toLocaleString()}? Esta acción no se puede deshacer.`,
      "donación"
    );

    if (!confirmed) return;

    try {
      showLoading(
        "Eliminando...",
        "Por favor espera mientras eliminamos la donación"
      );

      const response = await fetch(`/api/donaciones?id=${donacionId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      closeLoading();

      if (data.success) {
        showSuccess(
          "¡Eliminado!",
          "La donación ha sido eliminada exitosamente"
        );
        // Recargar el proyecto
        fetchProyecto();
      } else {
        showError("Error", data.message || "Error al eliminar la donación");
      }
    } catch (err) {
      closeLoading();
      showError("Error de conexión", "No se pudo conectar con el servidor");
    }
  };

  const handleDeleteOrden = async (
    ordenId: number,
    numero: string,
    proveedor: string,
    monto: number
  ) => {
    const confirmed = await confirmDelete(
      "¿Eliminar orden de compra?",
      `¿Estás seguro de que quieres eliminar la orden "${numero}" de "${proveedor}" por Q${monto.toLocaleString()}? Esta acción no se puede deshacer.`,
      "orden de compra"
    );

    if (!confirmed) return;

    try {
      showLoading(
        "Eliminando...",
        "Por favor espera mientras eliminamos la orden de compra"
      );

      const response = await fetch(`/api/ordenes-compra?id=${ordenId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      closeLoading();

      if (data.success) {
        showSuccess(
          "¡Eliminado!",
          "La orden de compra ha sido eliminada exitosamente"
        );
        // Recargar el proyecto
        fetchProyecto();
      } else {
        showError(
          "Error",
          data.message || "Error al eliminar la orden de compra"
        );
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

  if (error || !proyecto) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error || "Proyecto no encontrado"}</p>
              </div>
              <div className="mt-4">
                <Link
                  href="/proyectos"
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Volver a Proyectos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log("proyecto", proyecto);

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {proyecto.codigo} - {proyecto.nombre}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {proyecto.municipio}, {proyecto.departamento}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span
              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getEstadoColor(
                proyecto.estado
              )}`}
            >
              {proyecto.estado}
            </span>
            <Link
              href="/proyectos"
              className="bg-gray-100 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Volver
            </Link>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-500">
              Fecha de Inicio
            </h3>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {formatDate(proyecto.fechaInicio)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-500">Fecha de Fin</h3>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {proyecto.fechaFin
                ? formatDate(proyecto.fechaFin)
                : "No definida"}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <h3 className="text-sm font-medium text-gray-500">
              Total Renglones
            </h3>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {proyecto.renglones.length}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            {
              id: "renglones",
              label: "Renglones",
              count: proyecto.renglones.length,
              addUrl: `/renglones/nuevo?proyectoId=${proyecto.id}`,
            },
            {
              id: "donaciones",
              label: "Donaciones",
              count: proyecto.donaciones.length,
              addUrl: `/donaciones/nueva?proyectoId=${proyecto.id}`,
            },
            {
              id: "ordenes",
              label: "Órdenes de Compra",
              count: proyecto.ordenesCompra.length,
              addUrl: `/ordenes-compra/nueva?proyectoId=${proyecto.id}`,
            },
            { id: "estadisticas", label: "Estadísticas" },
          ].map((tab) => (
            <div key={tab.id} className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
              {tab.addUrl && (
                <Link
                  href={tab.addUrl}
                  className="inline-flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  title={`Agregar ${tab.label.slice(0, -1)}`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "renglones" && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {proyecto.renglones?.map((renglon) => {
                const stats = calculateRenglonStats(renglon);
                return (
                  <li key={renglon.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">
                          {renglon.nombre}
                        </h3>
                        <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Donado:</span>
                            <span className="ml-2 font-medium text-green-600">
                              {formatCurrency(
                                proyecto.donaciones
                                  .filter((d) => d.renglonId === renglon.id)
                                  .reduce((sum, d) => sum + d.monto, 0)
                              )}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Gastado:</span>
                            <span className="ml-2 font-medium text-red-600">
                              {formatCurrency(
                                proyecto.ordenesCompra
                                  .filter((d) => d.renglonId === renglon.id)
                                  .reduce((sum, d) => sum + d.monto, 0)
                              )}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Disponible:</span>
                            <span
                              className={`ml-2 font-medium ${
                                stats.disponibilidad >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {formatCurrency(
                                proyecto.donaciones
                                  .filter((d) => d.renglonId === renglon.id)
                                  .reduce((sum, d) => sum + d.monto, 0) -
                                  proyecto.ordenesCompra
                                    .filter((d) => d.renglonId === renglon.id)
                                    .reduce((sum, d) => sum + d.monto, 0)
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditForm('renglon', renglon.id, {
                            nombre: renglon.nombre,
                            proyectoId: proyecto.id
                          })}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteRenglon(renglon.id, renglon.nombre)
                          }
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            {proyecto.renglones.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No hay renglones registrados para este proyecto.
                </p>
                <Link
                  href={`/renglones/nuevo?proyectoId=${proyecto.id}`}
                  className="mt-4 inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Agregar Renglón
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === "donaciones" && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {proyecto.donaciones?.map((donacion) => (
                <li key={donacion.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {donacion.donante}
                      </h3>
                      <div className="mt-2 text-sm text-gray-500">
                        <span>Monto: </span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(donacion.monto)}
                        </span>
                        <span className="ml-4">
                          Fecha: {formatDate(donacion.fecha)}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditForm('donacion', donacion.id, {
                          monto: donacion.monto,
                          fecha: donacion.fecha,
                          donante: donacion.donante,
                          proyectoId: proyecto.id,
                          renglonId: donacion.renglonId
                        })}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteDonacion(
                            donacion.id,
                            donacion.donante,
                            donacion.monto
                          )
                        }
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {proyecto.donaciones.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No hay donaciones registradas para este proyecto.
                </p>
                <Link
                  href={`/donaciones/nueva?proyectoId=${proyecto.id}`}
                  className="mt-4 inline-flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Agregar Donación
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === "ordenes" && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {proyecto.ordenesCompra?.map((orden) => (
                <li key={orden.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        {orden.numero} - {orden.proveedor}
                      </h3>
                      <div className="mt-2 text-sm text-gray-500">
                        <span>Monto: </span>
                        <span className="font-medium text-red-600">
                          {formatCurrency(orden.monto)}
                        </span>
                        <span className="ml-4">
                          Fecha: {formatDate(orden.fecha)}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditForm('orden', orden.id, {
                          numero: orden.numero,
                          proveedor: orden.proveedor,
                          monto: orden.monto,
                          fecha: orden.fecha,
                          proyectoId: proyecto.id,
                          renglonId: orden.renglonId
                        })}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteOrden(
                            orden.id,
                            orden.numero,
                            orden.proveedor,
                            orden.monto
                          )
                        }
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {proyecto.ordenesCompra.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No hay órdenes de compra registradas para este proyecto.
                </p>
                <Link
                  href={`/ordenes-compra/nueva?proyectoId=${proyecto.id}`}
                  className="mt-4 inline-flex items-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Agregar Orden de Compra
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === "estadisticas" && (
          <div className="">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Resumen Financiero
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Donado:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(
                      proyecto.donaciones.reduce((sum, d) => sum + d.monto, 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Gastado:</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(
                      proyecto.ordenesCompra.reduce(
                        (sum, o) => sum + o.monto,
                        0
                      )
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-gray-900 font-medium">
                    Saldo Disponible:
                  </span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(
                      proyecto.donaciones.reduce((sum, d) => sum + d.monto, 0) -
                        proyecto.ordenesCompra.reduce(
                          (sum, o) => sum + o.monto,
                          0
                        )
                    )}
                  </span>
                </div>
              </div>
            </div>

           
          </div>
        )}
      </div>

      {/* Formularios de edición */}
      {editForm.isOpen && editForm.type === 'renglon' && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeEditForm} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
              <RenglonForm
                isEditing={true}
                renglonId={editForm.itemId}
                initialData={editForm.initialData}
                onClose={handleEditFormClose}
              />
            </div>
          </div>
        </div>
      )}

      {editForm.isOpen && editForm.type === 'donacion' && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeEditForm} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
              <DonacionForm
                isEditing={true}
                donacionId={editForm.itemId}
                initialData={editForm.initialData}
                onClose={handleEditFormClose}
              />
            </div>
          </div>
        </div>
      )}

      {editForm.isOpen && editForm.type === 'orden' && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeEditForm} />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative transform overflow-hidden rounded-lg bg-white shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
              <OrdenCompraForm
                isEditing={true}
                ordenId={editForm.itemId}
                initialData={editForm.initialData}
                onClose={handleEditFormClose}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
