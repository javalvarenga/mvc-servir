import Swal from 'sweetalert2'

export const useSweetAlert = () => {
  const confirmDelete = async (title: string, text: string, entityName: string) => {
    const result = await Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626', // red-600
      cancelButtonColor: '#6b7280', // gray-500
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true
    })

    return result.isConfirmed
  }

  const showSuccess = (title: string, text: string) => {
    Swal.fire({
      title: title,
      text: text,
      icon: 'success',
      confirmButtonColor: '#059669', // emerald-600
      confirmButtonText: 'Entendido'
    })
  }

  const showError = (title: string, text: string) => {
    Swal.fire({
      title: title,
      text: text,
      icon: 'error',
      confirmButtonColor: '#dc2626', // red-600
      confirmButtonText: 'Entendido'
    })
  }

  const showLoading = (title: string, text: string) => {
    Swal.fire({
      title: title,
      text: text,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })
  }

  const closeLoading = () => {
    Swal.close()
  }

  const confirmAction = async (title: string, text: string, confirmText: string = 'Confirmar') => {
    const result = await Swal.fire({
      title: title,
      text: text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2563eb', // blue-600
      cancelButtonColor: '#6b7280', // gray-500
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true
    })

    return result.isConfirmed
  }

  const showInfo = (title: string, text: string) => {
    Swal.fire({
      title: title,
      text: text,
      icon: 'info',
      confirmButtonColor: '#2563eb', // blue-600
      confirmButtonText: 'Entendido'
    })
  }

  return {
    confirmDelete,
    showSuccess,
    showError,
    showLoading,
    closeLoading,
    confirmAction,
    showInfo
  }
}