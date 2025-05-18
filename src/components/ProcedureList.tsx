'use client'

import React, { useState, useEffect } from 'react'
import { CustomerCategory } from './CategorySelector'
import { formatKRW } from '@/lib/currency'

type Procedure = {
  id: string;
  code: string;
  name: string;
  priceK10: number;
  priceK20: number;
  priceK30: number;
  sort_order: number;
}

type CartItem = {
  name: string;
  quantity: number;
  price: number;
}

type ProcedureListProps = {
  customerCategory: CustomerCategory;
  onTotalChange: (total: number, items: CartItem[]) => void;
  resetCounter: number;
}

export default function ProcedureList({ customerCategory, onTotalChange, resetCounter }: ProcedureListProps) {
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProcedures() {
      try {
        const response = await fetch('/api/procedures')
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.details || 'Failed to fetch procedures')
        }
        const data = await response.json()
        if (!Array.isArray(data)) {
          throw new Error('Invalid data format received from server')
        }
        console.log('Received procedures:', data)
        setProcedures(data)
        const initialQuantities = Object.fromEntries(data.map((p: Procedure) => [p.code, 0]))
        setQuantities(initialQuantities)
      } catch (err) {
        console.error('Error fetching procedures:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProcedures()
  }, [])

  useEffect(() => {
    if (procedures.length > 0) {
      const resetQuantities = Object.fromEntries(procedures.map(p => [p.code, 0]))
      setQuantities(resetQuantities)
    }
  }, [resetCounter, procedures])

  const handleQuantityChange = (code: string, value: string) => {
    const newValue = Math.max(0, parseInt(value) || 0)
    setQuantities(prev => ({ ...prev, [code]: newValue }))
  }

  const calculateTotal = (price: number, quantity: number) => {
    return price * (quantity || 0)
  }

  const getPriceForCategory = (procedure: Procedure, category: CustomerCategory) => {
    return procedure[`price${category}` as keyof Procedure] as number || 0
  }

  useEffect(() => {
    const selectedItems = procedures
      .filter(procedure => quantities[procedure.code] > 0)
      .map(procedure => ({
        name: procedure.name,
        quantity: quantities[procedure.code],
        price: getPriceForCategory(procedure, customerCategory)
      }));

    const total = procedures.reduce((sum, procedure) => {
      const quantity = quantities[procedure.code] || 0
      const price = getPriceForCategory(procedure, customerCategory)
      return sum + calculateTotal(price, quantity)
    }, 0)

    onTotalChange(total, selectedItems)
  }, [quantities, procedures, customerCategory, onTotalChange])

  if (loading) {
    return <div className="mt-8 text-center">Loading procedures...</div>
  }

  if (error) {
    return <div className="mt-8 text-center text-red-600">Error: {error}</div>
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Available Procedures</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[45%]">
                Procedure
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
          <tbody className="divide-y divide-gray-200">
            {procedures.map((procedure) => (
              <tr key={procedure.id || procedure.code} className="bg-white">
                <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-lg text-gray-900">
                  {procedure.name}
                </td>
                <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-lg text-gray-900 text-right tabular-nums">
                  {formatKRW(getPriceForCategory(procedure, customerCategory))}
                </td>
                <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-base text-center">
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <button
                      onClick={() => handleQuantityChange(procedure.code, String(Math.max(0, (quantities[procedure.code] || 0) - 1)))}
                      className="px-2 sm:px-3 py-1 sm:py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-l-md border border-gray-300 text-lg"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={quantities[procedure.code] || 0}
                      onChange={(e) => handleQuantityChange(procedure.code, e.target.value)}
                      className="w-12 sm:w-16 px-1 sm:px-2 py-1 sm:py-2 text-center bg-white border-y border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none tabular-nums text-lg"
                    />
                    <button
                      onClick={() => handleQuantityChange(procedure.code, String((quantities[procedure.code] || 0) + 1))}
                      className="px-2 sm:px-3 py-1 sm:py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-r-md border border-gray-300 text-lg"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-lg text-gray-900 text-right tabular-nums">
                  {formatKRW(calculateTotal(getPriceForCategory(procedure, customerCategory), quantities[procedure.code] || 0))}
                </td>
              </tr>
            ))}
            <tr key="total-row" className="bg-gray-50">
              <td colSpan={3} className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                Total:
              </td>
              <td className="px-2 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right tabular-nums">
                {formatKRW(procedures.reduce((sum, procedure) => {
                  const quantity = quantities[procedure.code] || 0
                  const price = getPriceForCategory(procedure, customerCategory)
                  return sum + calculateTotal(price, quantity)
                }, 0))}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
} 