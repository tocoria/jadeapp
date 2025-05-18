import { useState, useEffect } from 'react';
import { formatKRW } from '@/lib/currency';

export type Currency = 'KRW' | 'USD' | 'EUR' | 'QAR' | 'IDR' | 'GBP' | 'CAD' | 'AUD';

type CurrencySelectorProps = {
  amount: number;
  className?: string;
  showSelector?: boolean;
  selectedCurrency: Currency;
  onCurrencyChange?: (currency: Currency) => void;
}

export default function CurrencySelector({ 
  amount, 
  className = '', 
  showSelector = true,
  selectedCurrency,
  onCurrencyChange
}: CurrencySelectorProps) {
  const [rates, setRates] = useState<{[key: string]: number}>({
    USD: 0,
    EUR: 0,
    QAR: 0,
    IDR: 0,
    GBP: 0,
    CAD: 0,
    AUD: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchExchangeRates() {
      try {
        setLoading(true);
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/KRW');
        if (!response.ok) throw new Error('Failed to fetch exchange rates');
        const data = await response.json();
        
        setRates({
          USD: data.rates.USD,
          EUR: data.rates.EUR,
          QAR: data.rates.QAR,
          IDR: data.rates.IDR,
          GBP: data.rates.GBP,
          CAD: data.rates.CAD,
          AUD: data.rates.AUD
        });
        setError(null);
      } catch (err) {
        setError('Could not load exchange rates');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchExchangeRates();
    // Refresh rates every 5 minutes
    const interval = setInterval(fetchExchangeRates, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const formatAmount = (amount: number, currency: Currency) => {
    if (currency === 'KRW') {
      return formatKRW(amount);
    }

    const rate = rates[currency];
    if (!rate) {
      return formatKRW(amount); // Fallback to KRW if rate not available
    }

    const converted = amount * rate;
    
    // Special handling for IDR to show in millions/billions if needed
    if (currency === 'IDR') {
      if (converted >= 1000000000) {
        return `IDR ${(converted / 1000000000).toFixed(2)}B`;
      }
      if (converted >= 1000000) {
        return `IDR ${(converted / 1000000).toFixed(2)}M`;
      }
      return `IDR ${Math.round(converted).toLocaleString('id-ID')}`;
    }

    // Special handling for QAR to avoid RTL issues
    if (currency === 'QAR') {
      const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(converted);
      return `QAR ${formatted}`;
    }

    try {
      const options: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: currency,
        maximumFractionDigits: 2
      };

      // Use appropriate locale for each currency
      const locales: { [key in Currency]: string } = {
        USD: 'en-US',
        EUR: 'de-DE',
        GBP: 'en-GB',
        CAD: 'en-CA',
        AUD: 'en-AU',
        KRW: 'ko-KR',
        QAR: 'en-US',
        IDR: 'id-ID'
      };

      return new Intl.NumberFormat(locales[currency], options).format(converted);
    } catch (err) {
      console.error('Currency formatting error:', err);
      // Fallback to basic number formatting if currency formatting fails
      return `${currency} ${converted.toFixed(2)}`;
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2 justify-end">
        {showSelector && (
          <select
            value={selectedCurrency}
            onChange={(e) => onCurrencyChange?.(e.target.value as Currency)}
            className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-24"
            disabled={loading || !!error}
          >
            <option value="KRW">KRW (₩)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="QAR">QAR</option>
            <option value="IDR">IDR (Rp)</option>
            <option value="GBP">GBP (£)</option>
            <option value="CAD">CAD (C$)</option>
            <option value="AUD">AUD (A$)</option>
          </select>
        )}
        <span className={`text-lg font-bold tabular-nums text-right ${className}`}>
          {loading ? (
            'Loading...'
          ) : error ? (
            formatKRW(amount)
          ) : (
            selectedCurrency !== 'KRW' ? formatAmount(amount, selectedCurrency) : formatKRW(amount)
          )}
        </span>
      </div>
      {selectedCurrency !== 'KRW' && !loading && !error && (
        <span className="text-sm text-gray-500 tabular-nums">
          {formatKRW(amount)}
        </span>
      )}
    </div>
  );
} 