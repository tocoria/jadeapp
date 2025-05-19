import { formatKRW } from '@/lib/currency'

type CartItem = {
  name: string;
  quantity: number;
  price: number;
}

type CartSummaryProps = {
  promotions: CartItem[];
  procedures: CartItem[];
}

export default function CartSummary({ promotions, procedures }: CartSummaryProps) {
  const hasItems = promotions.length > 0 || procedures.length > 0;

  if (!hasItems) {
    return (
      <div className="text-gray-500 text-base text-center py-2">
        No items selected
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 mt-2 pt-2">
      <h3 className="text-base font-medium text-gray-700 mb-2">Selected Items:</h3>
      <div className="space-y-2">
        {promotions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Promotions</h4>
            {promotions.map((item, index) => (
              <div key={`promo-${index}`} className="flex justify-between items-baseline text-base">
                <div className="flex-1">
                  <span className="text-gray-700">{item.name}</span>
                  <span className="text-gray-500 ml-1">×{item.quantity}</span>
                </div>
                <span className="text-gray-700 tabular-nums ml-4">{formatKRW(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        )}
        
        {procedures.length > 0 && (
          <div className="mt-2">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Procedures</h4>
            {procedures.map((item, index) => (
              <div key={`proc-${index}`} className="flex justify-between items-baseline text-base">
                <div className="flex-1">
                  <span className="text-gray-700">{item.name}</span>
                  <span className="text-gray-500 ml-1">×{item.quantity}</span>
                </div>
                <span className="text-gray-700 tabular-nums ml-4">{formatKRW(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 