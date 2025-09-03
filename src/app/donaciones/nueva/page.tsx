'use client'

import { Suspense } from 'react'
import DonacionForm from '../../../components/DonacionForm'

export default function NuevaDonacionPage() {
  return (
    <Suspense fallback={
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    }>
      <DonacionForm />
    </Suspense>
  )
}