'use client'

import MainLayout from '@/components/layout/MainLayout'
import CategorySelector, { CustomerCategory, ProcedureCategory, AgencyCategory } from '@/components/CategorySelector'
import ProcedureList from '@/components/ProcedureList'
import PromotionList from '@/components/PromotionList'
import CartSummary from '@/components/CartSummary'
import CurrencySelector, { Currency } from '@/components/CurrencySelector'
import { useState, useCallback, useEffect } from 'react'

const TAX_RATE = 0.1 // 10% tax rate
const TAX_FREE_PROCEDURE_IDS = [
  '44ca9797-8bbd-4a30-83a6-b77166300532', // laughing gas
  '9a51d3ad-92cb-46bd-b3e0-272529ca9cde'  // sleep sedation
]

type SelectedCategories = {
  customer: CustomerCategory;
  commission: ProcedureCategory;
  agency: AgencyCategory;
}

type CartItem = {
  id?: string;  // Adding id to CartItem type
  name: string;
  quantity: number;
  price: number;
  isTaxFree?: boolean;
}

export default function Home() {
  const [selectedCategories, setSelectedCategories] = useState<SelectedCategories>({
    customer: 'K0',
    commission: '커0',
    agency: 'NO_AGENCY'
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

  const handleCategoriesChange = useCallback((customer: CustomerCategory, commission: ProcedureCategory, agency: AgencyCategory) => {
    setSelectedCategories({ customer, commission, agency })
  }, [])

  const handleProceduresTotalChange = useCallback((total: number, items: CartItem[]) => {
    // Mark tax-free items by ID
    const itemsWithTaxStatus = items.map(item => ({
      ...item,
      isTaxFree: item.id ? TAX_FREE_PROCEDURE_IDS.includes(item.id) : false
    }))
    setSelectedItems(prev => ({ ...prev, procedures: itemsWithTaxStatus }))
  }, [])

  const handlePromotionsTotalChange = useCallback((total: number, items: CartItem[]) => {
    setSelectedItems(prev => ({ ...prev, promotions: items }))
  }, [])

  const handleReset = useCallback(() => {
    setSelectedItems({ promotions: [], procedures: [] })
    setResetCounter(prev => prev + 1) // Increment reset counter to trigger resets
  }, [])

  const handleCurrencyChange = useCallback((currency: Currency) => {
    setSelectedCurrency(currency)
  }, [])

  const calculateFinalPrice = () => {
    // Split procedures into taxable and tax-free
    const taxableProcedures = selectedItems.procedures.filter(item => !item.isTaxFree)
    const taxFreeProcedures = selectedItems.procedures.filter(item => item.isTaxFree)
    
    // Calculate totals
    const taxableProceduresTotal = taxableProcedures.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const taxFreeProceduresTotal = taxFreeProcedures.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const promotionsTotal = selectedItems.promotions.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    // Apply tax to taxable procedures and promotions
    return (taxableProceduresTotal + promotionsTotal) * (1 + TAX_RATE) + taxFreeProceduresTotal
  }

  const calculateGrandTotal = () => {
    const proceduresTotal = selectedItems.procedures.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const promotionsTotal = selectedItems.promotions.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    return proceduresTotal + promotionsTotal
  }
  const grandTotal = calculateGrandTotal()
  const finalPrice = calculateFinalPrice()

  useEffect(() => {
    handleCategoriesChange('K0', '커0', 'NO_AGENCY');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MainLayout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Welcome to Lamiche Pricing
          </h1>
          <p className="mt-4 text-base leading-7 text-gray-600">
            Your comprehensive solution for managing and displaying pricing information.
          </p>
        </div>
        
        <div className="w-full">
          <div className="flex flex-col gap-6 md:gap-8 md:flex-row">
            <div className="w-full md:flex-1 space-y-6">
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
            
            <div className="w-full md:w-80">
              <div className="md:sticky md:top-24 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-baseline sm:justify-between gap-2">
                    <span className="text-gray-600 text-sm font-medium">Grand Total:</span>
                    <CurrencySelector 
                      amount={grandTotal} 
                      selectedCurrency={selectedCurrency}
                      onCurrencyChange={handleCurrencyChange}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-baseline sm:justify-between gap-2 pt-2 border-t border-gray-100">
                    <span className="text-gray-600 text-sm font-medium">Final Price (inc. tax):</span>
                    <div className="flex flex-col items-end">
                      <CurrencySelector 
                        amount={finalPrice} 
                        className="text-emerald-600"
                        selectedCurrency={selectedCurrency}
                        showSelector={false}
                      />
                      <span className="text-xs text-gray-500 mt-1">
                        * Laughing gas and sleep sedation are tax-free
                      </span>
                    </div>
                  </div>
                  <CartSummary 
                    promotions={selectedItems.promotions} 
                    procedures={selectedItems.procedures}
                    showTaxStatus={true}
                  />
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
        </div>
      </div>
    </MainLayout>
  )
}
