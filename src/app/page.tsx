'use client'

import MainLayout from '@/components/layout/MainLayout'
import CategorySelector, { CustomerCategory, ProcedureCategory } from '@/components/CategorySelector'
import ProcedureList from '@/components/ProcedureList'
import PromotionList from '@/components/PromotionList'
import CartSummary from '@/components/CartSummary'
import CurrencySelector, { Currency } from '@/components/CurrencySelector'
import { useState, useCallback } from 'react'

const TAX_RATE = 0.1 // 10% tax rate

type SelectedCategories = {
  customer: CustomerCategory;
  commission: ProcedureCategory;
}

type CartItem = {
  name: string;
  quantity: number;
  price: number;
}

export default function Home() {
  const [selectedCategories, setSelectedCategories] = useState<SelectedCategories>({
    customer: 'K10',
    commission: 'C0'
  })

  const [totals, setTotals] = useState({
    procedures: 0,
    promotions: 0
  })

  const [selectedItems, setSelectedItems] = useState<{
    promotions: CartItem[];
    procedures: CartItem[];
  }>({
    promotions: [],
    procedures: []
  })

  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('KRW')

  // Add a reset counter to force child components to reset
  const [resetCounter, setResetCounter] = useState(0)

  const handleCategoriesChange = useCallback((customer: CustomerCategory, commission: ProcedureCategory) => {
    setSelectedCategories({ customer, commission })
  }, [])

  const handleProceduresTotalChange = useCallback((total: number, items: CartItem[]) => {
    setTotals(prev => ({ ...prev, procedures: total }))
    setSelectedItems(prev => ({ ...prev, procedures: items }))
  }, [])

  const handlePromotionsTotalChange = useCallback((total: number, items: CartItem[]) => {
    setTotals(prev => ({ ...prev, promotions: total }))
    setSelectedItems(prev => ({ ...prev, promotions: items }))
  }, [])

  const handleReset = useCallback(() => {
    setTotals({ procedures: 0, promotions: 0 })
    setSelectedItems({ promotions: [], procedures: [] })
    setResetCounter(prev => prev + 1) // Increment reset counter to trigger resets
  }, [])

  const handleCurrencyChange = useCallback((currency: Currency) => {
    setSelectedCurrency(currency)
  }, [])

  const grandTotal = totals.procedures + totals.promotions
  const finalPrice = grandTotal * (1 + TAX_RATE)

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Welcome to Jade Pricing
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Your comprehensive solution for managing and displaying pricing information.
          </p>
        </div>
        
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col-reverse gap-6 md:gap-8 md:flex-row md:items-start md:justify-between mb-8">
            <div className="w-full space-y-6">
              <CategorySelector onCategoriesChange={handleCategoriesChange} />
              <PromotionList 
                customerCategory={selectedCategories.customer}
                commissionCategory={selectedCategories.commission}
                onTotalChange={handlePromotionsTotalChange}
                resetCounter={resetCounter}
              />
              <ProcedureList 
                customerCategory={selectedCategories.customer}
                onTotalChange={handleProceduresTotalChange}
                resetCounter={resetCounter}
              />
            </div>
            <div className="w-full md:w-auto md:min-w-[400px] flex flex-col gap-2 bg-white border border-gray-200 px-4 md:px-6 py-4 rounded-lg shadow-sm sticky top-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-baseline sm:justify-between gap-2">
                <span className="text-gray-600 text-sm font-medium">Grand Total:</span>
                <CurrencySelector 
                  amount={grandTotal} 
                  selectedCurrency={selectedCurrency}
                  onCurrencyChange={handleCurrencyChange}
                />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-baseline sm:justify-between gap-2 pt-2 border-t border-gray-100">
                <span className="text-gray-600 text-sm font-medium">Final Price (inc. 10% tax):</span>
                <CurrencySelector 
                  amount={finalPrice} 
                  className="text-emerald-600"
                  selectedCurrency={selectedCurrency}
                  showSelector={false}
                />
              </div>
              <CartSummary promotions={selectedItems.promotions} procedures={selectedItems.procedures} />
              <button
                onClick={handleReset}
                className="mt-2 w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors text-sm font-medium"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
