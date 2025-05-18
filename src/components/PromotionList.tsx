'use client'

import { CustomerCategory, ProcedureCategory } from './CategorySelector'
import { useState, useEffect } from 'react'
import { formatKRW } from '@/lib/currency'
import { Promotion } from '@/types/promotion'

interface PromotionListProps {
  customerCategory: CustomerCategory
  commissionCategory: ProcedureCategory
  onTotalChange: (total: number) => void
  resetCounter: number
}

export default function PromotionList({ customerCategory, commissionCategory, onTotalChange, resetCounter }: PromotionListProps) {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Always call hooks at the top level
  useEffect(() => {
    // Reset total for K30 and K20+C3
    if (customerCategory === 'K30' || (customerCategory === 'K20' && commissionCategory === 'C3')) {
      onTotalChange(0)
      return
    }

    let isMounted = true;

    async function fetchPromotions() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/promotions?customerCategory=${customerCategory}&commissionCategory=${commissionCategory}`
        )
        if (!response.ok) throw new Error('Failed to fetch promotions')
        const data = await response.json()
        
        if (isMounted) {
          setPromotions(data)
          setQuantities(Object.fromEntries(data.map((p: Promotion) => [p.code, 0])))
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'An error occurred')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchPromotions()

    return () => {
      isMounted = false;
    }
  }, [customerCategory, commissionCategory, onTotalChange])

  useEffect(() => {
    if (promotions.length > 0) {
      setQuantities(Object.fromEntries(promotions.map(p => [p.code, 0])))
    }
  }, [resetCounter, promotions])

  const handleQuantityChange = (code: string, value: string) => {
    const newValue = Math.max(0, parseInt(value) || 0)
    setQuantities(prev => ({ ...prev, [code]: newValue }))
  }

  const calculateTotal = (price: number, quantity: number) => {
    return price * (quantity || 0)
  }

  const overallTotal = promotions.reduce((sum, promotion) => {
    const quantity = quantities[promotion.code] || 0
    const price = promotion.price || 0
    return sum + calculateTotal(price, quantity)
  }, 0)

  useEffect(() => {
    onTotalChange(overallTotal || 0)
  }, [overallTotal, onTotalChange])

  // Return null for K30 and K20+C3 after all hooks are called
  if (customerCategory === 'K30' || (customerCategory === 'K20' && commissionCategory === 'C3')) {
    return null
  }

  if (loading) {
    return <div className="mt-8 text-center">Loading promotions...</div>
  }

  if (error) {
    return <div className="mt-8 text-center text-red-600">Error: {error}</div>
  }

  if (promotions.length === 0) {
    return (
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Available Promotions</h2>
        </div>
        <p className="text-gray-500 text-center py-4">No promotions available for the selected categories.</p>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Available Promotions</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[45%]">
                Promotion
              </th>
              <th scope="col" className="px-2 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                Price
              </th>
              <th scope="col" className="px-2 sm:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[15%]">
                Qty
              </th>
              <th scope="col" className="px-2 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {promotions.map((promotion) => (
              <tr key={promotion.code}>
                <td className="px-2 sm:px-6 py-4 text-sm text-gray-900">
                  <div className="font-medium">{promotion.name}</div>
                  <div className="text-gray-500 mt-1 text-xs sm:text-sm">{promotion.description}</div>
                </td>
                <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right tabular-nums">
                  {formatKRW(promotion.price)}
                </td>
                <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-center">
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <button
                      onClick={() => handleQuantityChange(promotion.code, String(Math.max(0, (quantities[promotion.code] || 0) - 1)))}
                      className="px-2 sm:px-3 py-1 sm:py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-l-md border border-gray-300"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={quantities[promotion.code] || 0}
                      onChange={(e) => handleQuantityChange(promotion.code, e.target.value)}
                      className="w-12 sm:w-16 px-1 sm:px-2 py-1 sm:py-2 text-center bg-white border-y border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none tabular-nums text-sm"
                    />
                    <button
                      onClick={() => handleQuantityChange(promotion.code, String((quantities[promotion.code] || 0) + 1))}
                      className="px-2 sm:px-3 py-1 sm:py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-r-md border border-gray-300"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right tabular-nums">
                  {formatKRW(calculateTotal(promotion.price, quantities[promotion.code] || 0))}
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50">
              <td colSpan={3} className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                Total:
              </td>
              <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right tabular-nums">
                {formatKRW(overallTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
} 