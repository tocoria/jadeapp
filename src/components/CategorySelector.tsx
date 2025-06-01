'use client'

import React, { useState, useEffect } from 'react'

export type CustomerCategory = 'K0' | 'K20' | 'K25' | 'K30'
export type ProcedureCategory = '커0' | '커2' | '커3' | '커25' | 'NO EVENT'
export type AgencyCategory = 'NO_AGENCY' | 'TOYOTO' | 'ISRA' | 'LEEYONGRIM'

interface CategorySelectorProps {
  onCategoriesChange: (customer: CustomerCategory, procedure: ProcedureCategory, agency: AgencyCategory) => void
}

const customerCategoryColors: Record<CustomerCategory, { bg: string, text: string }> = {
  'K0': { bg: 'bg-white', text: 'text-gray-900' },
  'K20': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'K25': { bg: 'bg-green-100', text: 'text-green-800' },
  'K30': { bg: 'bg-orange-100', text: 'text-orange-800' }
}

const procedureCategoryColors: Record<ProcedureCategory, { bg: string, text: string }> = {
  '커0': { bg: 'bg-white', text: 'text-gray-900' },
  '커2': { bg: 'bg-pink-100', text: 'text-pink-800' },
  '커3': { bg: 'bg-red-100', text: 'text-red-800' },
  '커25': { bg: 'bg-orange-100', text: 'text-orange-800' },
  'NO EVENT': { bg: 'bg-gray-100', text: 'text-gray-800' }
}

const agencyCategoryColors: Record<AgencyCategory, { bg: string, text: string }> = {
  'NO_AGENCY': { bg: 'bg-white', text: 'text-gray-900' },
  'TOYOTO': { bg: 'bg-white', text: 'text-gray-900' },
  'ISRA': { bg: 'bg-white', text: 'text-gray-900' },
  'LEEYONGRIM': { bg: 'bg-white', text: 'text-gray-900' }
}

const CUSTOMER_CATEGORIES: { value: CustomerCategory; label: string }[] = [
  { value: 'K0', label: 'K0' },
  { value: 'K20', label: 'K20' },
  { value: 'K25', label: 'K25' },
  { value: 'K30', label: 'K30' },
]

const PROCEDURE_CATEGORIES: { value: ProcedureCategory; label: string }[] = [
  { value: '커0', label: '커0' },
  { value: '커2', label: '커2' },
  { value: '커25', label: '커25' },
  { value: '커3', label: '커3' },
  { value: 'NO EVENT', label: 'NO EVENT' },
]

const AGENCY_CATEGORIES: { value: AgencyCategory; label: string }[] = [
  { value: 'NO_AGENCY', label: 'No agency' },
  { value: 'TOYOTO', label: '투유투어' },
  { value: 'ISRA', label: '이스라' },
  { value: 'LEEYONGRIM', label: '이용림' },
]

export default function CategorySelector({ onCategoriesChange }: CategorySelectorProps) {
  const [customerCategory, setCustomerCategory] = useState<CustomerCategory>('K0')
  const [procedureCategory, setProcedureCategory] = useState<ProcedureCategory>('커0')
  const [agencyCategory, setAgencyCategory] = useState<AgencyCategory>('NO_AGENCY')
  const [customerOpen, setCustomerOpen] = useState(false)
  const [procedureOpen, setProcedureOpen] = useState(false)
  const [agencyOpen, setAgencyOpen] = useState(false)

  // Function to determine if selectors should be disabled
  const isSelectorDisabled = (agency: AgencyCategory) => {
    return agency === 'TOYOTO' || agency === 'LEEYONGRIM' || agency === 'ISRA'
  }

  // Function to get the required categories based on agency
  const getRequiredCategories = (agency: AgencyCategory): { customer: CustomerCategory; procedure: ProcedureCategory } => {
    switch (agency) {
      case 'TOYOTO':
      case 'LEEYONGRIM':
        return { customer: 'K20', procedure: 'NO EVENT' }
      case 'ISRA':
        return { customer: 'K20', procedure: '커3' }
      default:
        return { customer: customerCategory, procedure: procedureCategory }
    }
  }

  const handleAgencyChange = (value: AgencyCategory) => {
    setAgencyCategory(value)
    setAgencyOpen(false)
    
    // If agency requires specific categories, update them
    if (isSelectorDisabled(value)) {
      const { customer, procedure } = getRequiredCategories(value)
      setCustomerCategory(customer)
      setProcedureCategory(procedure)
      onCategoriesChange(customer, procedure, value)
    } else {
      onCategoriesChange(customerCategory, procedureCategory, value)
    }
  }

  const handleCustomerChange = (value: CustomerCategory) => {
    if (isSelectorDisabled(agencyCategory)) return
    setCustomerCategory(value)
    setCustomerOpen(false)
    onCategoriesChange(value, procedureCategory, agencyCategory)
  }

  const handleProcedureChange = (value: ProcedureCategory) => {
    if (isSelectorDisabled(agencyCategory)) return
    setProcedureCategory(value)
    setProcedureOpen(false)
    onCategoriesChange(customerCategory, value, agencyCategory)
  }

  // Update categories when agency changes
  useEffect(() => {
    if (isSelectorDisabled(agencyCategory)) {
      const { customer, procedure } = getRequiredCategories(agencyCategory)
      setCustomerCategory(customer)
      setProcedureCategory(procedure)
      onCategoriesChange(customer, procedure, agencyCategory)
    }
  }, [agencyCategory])

  return (
    <div className="flex gap-6 items-start">
      <div className="flex flex-col gap-2">
        <label className="text-base font-medium text-gray-700">
          Customer Category
        </label>
        <div className="relative">
          <button
            onClick={() => {
              if (isSelectorDisabled(agencyCategory)) return
              setCustomerOpen(!customerOpen)
              setProcedureOpen(false)
            }}
            className={`flex items-center justify-between w-40 py-3 px-4 text-lg rounded-md border border-gray-300 shadow-sm transition-colors ${
              isSelectorDisabled(agencyCategory) 
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                : `hover:bg-gray-50 ${customerCategoryColors[customerCategory].bg} ${customerCategoryColors[customerCategory].text}`
            }`}
          >
            <span>{customerCategory}</span>
            <svg className={`h-5 w-5 transition-transform ${customerOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {customerOpen && !isSelectorDisabled(agencyCategory) && (
            <div className="absolute z-10 w-full mt-1 rounded-md bg-white border border-gray-300 shadow-lg">
              {CUSTOMER_CATEGORIES.map(({ value }) => (
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
              if (isSelectorDisabled(agencyCategory)) return
              setProcedureOpen(!procedureOpen)
              setCustomerOpen(false)
            }}
            className={`flex items-center justify-between w-40 py-3 px-4 text-lg rounded-md border border-gray-300 shadow-sm transition-colors ${
              isSelectorDisabled(agencyCategory) 
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                : `hover:bg-gray-50 ${procedureCategoryColors[procedureCategory].bg} ${procedureCategoryColors[procedureCategory].text}`
            }`}
          >
            <span>{procedureCategory}</span>
            <svg className={`h-5 w-5 transition-transform ${procedureOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {procedureOpen && !isSelectorDisabled(agencyCategory) && (
            <div className="absolute z-10 w-full mt-1 rounded-md bg-white border border-gray-300 shadow-lg">
              {PROCEDURE_CATEGORIES.map(({ value }) => (
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

      <div className="flex flex-col gap-2">
        <label className="text-base font-medium text-gray-700">
          Agency
        </label>
        <div className="relative">
          <button
            onClick={() => {
              setAgencyOpen(!agencyOpen)
              setCustomerOpen(false)
              setProcedureOpen(false)
            }}
            className={`flex items-center justify-between w-40 py-3 px-4 text-lg rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors ${agencyCategoryColors[agencyCategory].bg} ${agencyCategoryColors[agencyCategory].text}`}
          >
            <span>{AGENCY_CATEGORIES.find(cat => cat.value === agencyCategory)?.label}</span>
            <svg className={`h-5 w-5 transition-transform ${agencyOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {agencyOpen && (
            <div className="absolute z-10 w-full mt-1 rounded-md bg-white border border-gray-300 shadow-lg">
              {AGENCY_CATEGORIES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleAgencyChange(value)}
                  className={`w-full text-left px-4 py-3 text-lg hover:bg-gray-50 transition-colors ${
                    agencyCategoryColors[value].bg
                  } ${agencyCategoryColors[value].text}`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 