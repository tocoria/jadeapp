'use client'

import { useState } from 'react'

export type CustomerCategory = 'K10' | 'K20' | 'K30'
export type ProcedureCategory = 'C0' | 'C2' | 'C3'

interface CategorySelectorProps {
  onCategoriesChange: (customer: CustomerCategory, procedure: ProcedureCategory) => void
}

const customerCategoryColors: Record<CustomerCategory, { bg: string, text: string }> = {
  'K10': { bg: 'bg-white', text: 'text-gray-900' },
  'K20': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'K30': { bg: 'bg-orange-100', text: 'text-orange-800' }
}

const procedureCategoryColors: Record<ProcedureCategory, { bg: string, text: string }> = {
  'C0': { bg: 'bg-white', text: 'text-gray-900' },
  'C2': { bg: 'bg-pink-100', text: 'text-pink-800' },
  'C3': { bg: 'bg-red-100', text: 'text-red-800' }
}

export default function CategorySelector({ onCategoriesChange }: CategorySelectorProps) {
  const [customerCategory, setCustomerCategory] = useState<CustomerCategory>('K10')
  const [procedureCategory, setProcedureCategory] = useState<ProcedureCategory>('C0')
  const [customerOpen, setCustomerOpen] = useState(false)
  const [procedureOpen, setProcedureOpen] = useState(false)

  const handleCustomerChange = (value: CustomerCategory) => {
    setCustomerCategory(value)
    setCustomerOpen(false)
    onCategoriesChange(value, procedureCategory)
  }

  const handleProcedureChange = (value: ProcedureCategory) => {
    setProcedureCategory(value)
    setProcedureOpen(false)
    onCategoriesChange(customerCategory, value)
  }

  return (
    <div className="flex gap-6 items-start">
      <div className="flex flex-col gap-2">
        <label className="text-base font-medium text-gray-700">
          Customer Category
        </label>
        <div className="relative">
          <button
            onClick={() => {
              setCustomerOpen(!customerOpen)
              setProcedureOpen(false)
            }}
            className={`flex items-center justify-between w-40 py-3 px-4 text-lg rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors ${customerCategoryColors[customerCategory].bg} ${customerCategoryColors[customerCategory].text}`}
          >
            <span>{customerCategory}</span>
            <svg className={`h-5 w-5 transition-transform ${customerOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {customerOpen && (
            <div className="absolute z-10 w-full mt-1 rounded-md bg-white border border-gray-300 shadow-lg">
              {(['K10', 'K20', 'K30'] as CustomerCategory[]).map((value) => (
                <button
                  key={value}
                  onClick={() => handleCustomerChange(value)}
                  className={`w-full text-left px-4 py-3 text-lg hover:bg-gray-50 transition-colors ${
                    customerCategoryColors[value].bg
                  } ${customerCategoryColors[value].text}`}
                >
                  {value}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-base font-medium text-gray-700">
          Commission Category
        </label>
        <div className="relative">
          <button
            onClick={() => {
              setProcedureOpen(!procedureOpen)
              setCustomerOpen(false)
            }}
            className={`flex items-center justify-between w-40 py-3 px-4 text-lg rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors ${procedureCategoryColors[procedureCategory].bg} ${procedureCategoryColors[procedureCategory].text}`}
          >
            <span>{procedureCategory}</span>
            <svg className={`h-5 w-5 transition-transform ${procedureOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {procedureOpen && (
            <div className="absolute z-10 w-full mt-1 rounded-md bg-white border border-gray-300 shadow-lg">
              {(['C0', 'C2', 'C3'] as ProcedureCategory[]).map((value) => (
                <button
                  key={value}
                  onClick={() => handleProcedureChange(value)}
                  className={`w-full text-left px-4 py-3 text-lg hover:bg-gray-50 transition-colors ${
                    procedureCategoryColors[value].bg
                  } ${procedureCategoryColors[value].text}`}
                >
                  {value}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 