'use client'

import { Suspense } from 'react'
import RenglonForm from '../../../components/RenglonForm'

export default function NuevoRenglonPage() {
  return (
    <Suspense fallback={
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    }>
      <RenglonForm />
    </Suspense>
  )
}