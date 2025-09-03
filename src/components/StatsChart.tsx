import { formatCurrency } from '../utils'

export default function StatsChart({ title, data, type = 'bar' }: any) {
  const maxValue = Math.max(...data.map((d: any) => d.value))

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-GT').format(num)
  }

  if (type === 'pie') {
    const total = data.reduce((sum: number, item: any) => sum + item.value, 0)
    let cumulativePercentage = 0

    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
          {title}
        </h3>
        <div className="flex items-center justify-center">
          <div className="relative w-48 h-48">
            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
              {data.map((item: any, index: number) => {
                const percentage = (item.value / total) * 100
                const strokeDasharray = `${percentage} ${100 - percentage}`
                const strokeDashoffset = -cumulativePercentage
                cumulativePercentage += percentage

                return (
                  <circle
                    key={index}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={item.color || `hsl(${index * 60}, 70%, 50%)`}
                    strokeWidth="8"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300"
                  />
                )
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatNumber(total)}
                </div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {data.map((item: any, index: number) => {
            const percentage = ((item.value / total) * 100).toFixed(1)
            return (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color || `hsl(${index * 60}, 70%, 50%)` }}
                  />
                  <span className="text-gray-700">{item.label}</span>
                </div>
                <div className="text-gray-900 font-medium">
                  {formatNumber(item.value)} ({percentage}%)
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
        {title}
      </h3>
      <div className="space-y-3">
        {data.map((item: any, index: number) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0
          return (
            <div key={index} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">{item.label}</span>
                <span className="text-gray-900 font-medium">
                  {formatCurrency(item.value)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    item.color || 'bg-blue-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}