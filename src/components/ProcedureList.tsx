'use client'

import React, { useState, useEffect } from 'react'
import { CustomerCategory } from './CategorySelector'
import { formatKRW } from '@/lib/currency'
import { v4 as uuidv4 } from 'uuid'
import ProcedureTypeTabs, { ProcedureType } from './ProcedureTypeTabs'

type Procedure = {
  id: string;
  name: string;
  type: ProcedureType;
  priceK0: number | null;
  priceK20: number | null;
  priceK25: number | null;
  priceK30: number | null;
  sort_order: number;
}

type CartItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

type ProcedureListProps = {
  customerCategory: CustomerCategory;
  onTotalChange: (total: number, items: CartItem[]) => void;
  resetCounter: number;
}

// Tax-free procedure IDs
const TAX_FREE_PROCEDURE_IDS = [
  '44ca9797-8bbd-4a30-83a6-b77166300532',
  '9a51d3ad-92cb-46bd-b3e0-272529ca9cde'
];

export default function ProcedureList({ customerCategory, onTotalChange, resetCounter }: ProcedureListProps) {
  const [procedures, setProcedures] = useState<Procedure[]>([])
  const [selectedType, setSelectedType] = useState<ProcedureType>('MAIN')
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customProcedures, setCustomProcedures] = useState<CartItem[]>([])
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [customName, setCustomName] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [customError, setCustomError] = useState('')
  const [customQuantity, setCustomQuantity] = useState('1')

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
        data.forEach((p: Procedure, index: number) => {
          if (!p.id) {
            console.error(`Procedure at index ${index} is missing id:`, p);
          }
        });
        setProcedures(data)
        const initialQuantities = Object.fromEntries(data.map((p: Procedure) => [p.id, 0]))
        console.log('Setting initial quantities:', initialQuantities)
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
    console.log('Reset effect triggered. Counter:', resetCounter)
    const resetQuantities = Object.fromEntries(procedures.map(p => [p.id, 0]))
    console.log('Resetting quantities to:', resetQuantities)
    setQuantities(resetQuantities)
    setCustomProcedures([])
  }, [procedures, resetCounter])

  useEffect(() => {
    const selectedItems = [
      ...procedures
        .filter(procedure => quantities[procedure.id] > 0)
        .map(procedure => {
          const price = getPriceForCategory(procedure, customerCategory);
          return {
            id: procedure.id,
            name: procedure.name,
            quantity: quantities[procedure.id],
            price: price ?? 0,
          };
        }),
      ...customProcedures
    ];
    const total =
      procedures.reduce((sum, procedure) => {
        const quantity = quantities[procedure.id] || 0;
        const price = getPriceForCategory(procedure, customerCategory) || 0;
        const isTaxFree = TAX_FREE_PROCEDURE_IDS.includes(procedure.id);
        return sum + (isTaxFree ? calculateTotal(price, quantity) : calculateTotal(price, quantity) * 1.1);
      }, 0) +
      customProcedures.reduce((sum, item) => sum + item.price * item.quantity * 1.1, 0);
    onTotalChange(total, selectedItems);
  }, [quantities, procedures, customerCategory, onTotalChange, customProcedures]);

  const handleQuantityChange = (id: string, value: string) => {
    if (!id) {
      console.error('Attempted to change quantity with undefined id');
      return;
    }
    const newValue = Math.max(0, parseInt(value) || 0)
    console.log('Changing quantity for id:', id)
    console.log('Current quantities:', quantities)
    setQuantities(prev => {
      console.log('Previous quantities in setter:', prev)
      const newQuantities = { ...prev }
      newQuantities[id] = newValue
      console.log('New quantities:', newQuantities)
      return newQuantities
    })
  }

  const calculateTotal = (price: number | null, quantity: number) => {
    if (price == null) return 0;
    return price * (quantity || 0);
  }

  const getPriceForCategory = (procedure: Procedure, category: CustomerCategory): number | null => {
    const priceMap: Record<CustomerCategory, keyof Procedure> = {
      K0: 'priceK0',
      K20: 'priceK20',
      K25: 'priceK25',
      K30: 'priceK30',
    };
    const value = procedure[priceMap[category]];
    return typeof value === 'number' ? value : null;
  }

  const handleAddCustomProcedure = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError('');
    if (!customName.trim()) {
      setCustomError('Name is required');
      return;
    }
    const priceNum = parseFloat(customPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setCustomError('Price must be a positive number');
      return;
    }
    const quantityNum = parseInt(customQuantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      setCustomError('Quantity must be a positive integer');
      return;
    }
    setCustomProcedures(prev => [
      ...prev,
      {
        id: uuidv4(),
        name: `${customName} (custom)`,
        quantity: quantityNum,
        price: priceNum,
      },
    ]);
    setCustomName('');
    setCustomPrice('');
    setCustomQuantity('1');
    setShowCustomForm(false);
  };

  // Filter procedures by selected type
  const filteredProcedures = procedures.filter(procedure => procedure.type === selectedType)

  if (loading) {
    return <div className="mt-8 text-center">Loading procedures...</div>
  }

  if (error) {
    return <div className="mt-8 text-center text-red-600">Error: {error}</div>
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-8">
          <h2 className="text-xl font-semibold text-gray-900">Procedures</h2>
          <ProcedureTypeTabs 
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            availableTypes={Array.from(new Set(procedures.map(p => p.type))) as ProcedureType[]}
          />
        </div>
        <button
          className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
          onClick={() => setShowCustomForm(v => !v)}
        >
          {showCustomForm ? 'Cancel' : 'Add Custom Procedure'}
        </button>
      </div>
      {showCustomForm && (
        <form onSubmit={handleAddCustomProcedure} className="mb-4 flex gap-2 items-end">
          <div>
            <label className="block text-xs text-gray-600">Name</label>
            <input
              type="text"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
              className="border px-2 py-1 rounded w-40"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Price (₩)</label>
            <input
              type="number"
              min="0"
              step="any"
              value={customPrice}
              onChange={e => setCustomPrice(e.target.value)}
              className="border px-2 py-1 rounded w-28"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600">Quantity</label>
            <input
              type="number"
              min="1"
              step="1"
              value={customQuantity}
              onChange={e => setCustomQuantity(e.target.value)}
              className="border px-2 py-1 rounded w-20"
              required
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
          >
            Add
          </button>
          {customError && <span className="text-red-500 text-xs ml-2">{customError}</span>}
        </form>
      )}
      <div className="w-full overflow-x-auto">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[40%]">
                Procedure
              </th>
              <th scope="col" className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                Price
              </th>
              <th scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                Qty
              </th>
              <th scope="col" className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[20%]">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProcedures.map((procedure) => {
              const priceAvailable = getPriceForCategory(procedure, customerCategory) != null;
              const isTaxFree = TAX_FREE_PROCEDURE_IDS.includes(procedure.id);
              // Debug log
              console.log('Procedure:', procedure.id, procedure.name, 'isTaxFree:', isTaxFree);
              return (
                <tr key={procedure.id}>
                  <td className="px-2 py-4 text-sm text-gray-900">
                    <div className="font-medium">{procedure.name}</div>
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 text-right tabular-nums">
                    {priceAvailable ? formatKRW(getPriceForCategory(procedure, customerCategory) || 0) : '-'}
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-center">
                    {priceAvailable ? (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => {
                            const currentQty = quantities[procedure.id] || 0;
                            handleQuantityChange(procedure.id, String(Math.max(0, currentQty - 1)));
                          }}
                          className="px-2 py-1 bg-white hover:bg-gray-50 text-gray-700 rounded-l-md border border-gray-300 text-sm"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={quantities[procedure.id] || 0}
                          onChange={(e) => {
                            const id = procedure.id;
                            if (!id) {
                              console.error('Missing procedure id:', procedure);
                              return;
                            }
                            handleQuantityChange(id, e.target.value);
                          }}
                          className="w-12 px-1 py-1 text-center bg-white border-y border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none tabular-nums text-sm"
                        />
                        <button
                          onClick={() => {
                            const currentQty = quantities[procedure.id] || 0;
                            handleQuantityChange(procedure.id, String(currentQty + 1));
                          }}
                          className="px-2 py-1 bg-white hover:bg-gray-50 text-gray-700 rounded-r-md border border-gray-300 text-sm"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 text-right tabular-nums">
                    {priceAvailable
                      ? formatKRW(
                          isTaxFree
                            ? calculateTotal(getPriceForCategory(procedure, customerCategory) || 0, quantities[procedure.id] || 0)
                            : calculateTotal(getPriceForCategory(procedure, customerCategory) || 0, quantities[procedure.id] || 0) * 1.1
                        )
                      : '-'}
                  </td>
                </tr>
              );
            })}
            {customProcedures.map((item) => (
              <tr key={item.id}>
                <td className="px-2 py-4 text-sm text-gray-900">
                  <div className="font-medium">{item.name}</div>
                </td>
                <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 text-right tabular-nums">
                  {formatKRW(item.price)}
                </td>
                <td className="px-2 py-4 whitespace-nowrap text-sm text-center">
                  <span className="text-gray-500">{item.quantity}</span>
                </td>
                <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 text-right tabular-nums">
                  {formatKRW(item.price * item.quantity * 1.1)} <span className="text-xs text-gray-500">(incl. 10% tax)</span>
                </td>
              </tr>
            ))}
            <tr className="bg-gray-50">
              <td colSpan={3} className="px-2 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                Total:
              </td>
              <td className="px-2 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right tabular-nums">
                {formatKRW(
                  procedures.reduce((sum, procedure) => {
                    const quantity = quantities[procedure.id] || 0;
                    const price = getPriceForCategory(procedure, customerCategory) || 0;
                    const isTaxFree = TAX_FREE_PROCEDURE_IDS.includes(procedure.id);
                    return sum + (isTaxFree ? calculateTotal(price, quantity) : calculateTotal(price, quantity) * 1.1);
                  }, 0) + customProcedures.reduce((sum, item) => sum + item.price * item.quantity * 1.1, 0)
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
} 