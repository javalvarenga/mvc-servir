import { formatCurrency } from '../utils'

export default function ActivityList({ title, items, emptyMessage }: any) {

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getTypeIcon = (type: string) => {
    if (type === 'donacion') {
      return (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>
      )
    } else {
      return (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
          </div>
        </div>
      )
    }
  }

  const getTypeColor = (type: string) => {
    return type === 'donacion' ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          {title}
        </h3>
        
        {items?.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {items?.map((item: any, index: number) => (
                <li key={item.id}>
                  <div className="relative pb-8">
                    {index !== items?.length - 1 && (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex space-x-3">
                      {getTypeIcon(item.type)}
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-500">
                            <span className="font-medium text-gray-900">{item.title}</span>
                          </p>
                          <p className="text-sm text-gray-500">{item.subtitle}</p>
                          {item.project && (
                            <p className="text-xs text-gray-400">
                              Proyecto: {item.project}
                              {item.renglon && ` • Renglón: ${item.renglon}`}
                            </p>
                          )}
                        </div>
                        <div className="text-right text-sm whitespace-nowrap">
                          <p className={`font-medium ${getTypeColor(item.type)}`}>
                            {formatCurrency(item.amount)}
                          </p>
                          <p className="text-gray-500">{formatDate(item.date)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}