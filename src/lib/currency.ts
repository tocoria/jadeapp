// Exchange rate (1 USD to KRW) - you may want to use a real-time API in production
const USD_TO_KRW = 1300; // Example fixed rate

export const convertUSDtoKRW = (usdAmount: number): number => {
  return usdAmount * USD_TO_KRW;
};

export const formatKRW = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    currencyDisplay: 'symbol',
  }).format(amount);
}; 