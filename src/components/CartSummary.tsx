import { formatKRW } from '@/lib/currency'

type CartItem = {
  name: string;
  quantity: number;
  price: number;
  isTaxFree?: boolean;
}

type CartSummaryProps = {
  promotions: CartItem[];
  procedures: CartItem[];
  showTaxStatus?: boolean;
}

export default function CartSummary({ promotions, procedures, showTaxStatus = false }: CartSummaryProps) {
  const allItems = [...promotions, ...procedures].filter(item => item.quantity > 0)

  if (allItems.length === 0) {
    return null
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <h3 className="text-sm font-medium text-gray-900 mb-2">Cart Summary</h3>
      <div className="space-y-2">
        {allItems.map((item, index) => (
          <div key={index} className="flex justify-between items-start text-sm">
            <div className="flex-1">
              <span className="text-gray-600">{item.name}</span>
              {showTaxStatus && item.isTaxFree && (
                <span className="ml-1 text-xs text-emerald-600">(tax-free)</span>
              )}
              <span className="text-gray-400 ml-1">× {item.quantity}</span>
            </div>
            <span className="text-gray-900 tabular-nums">
              {formatKRW(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
} 