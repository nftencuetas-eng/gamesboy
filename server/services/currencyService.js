/**
 * Currency Conversion Service
 */
let exchangeRates = {
  PYG: 7500, // 1 USD = 7,500 Guaraníes
  ARS: 1250, // 1 USD = 1,250 Pesos Argentinos
  BRL: 5.60  // 1 USD = 5.60 Reales
};

export function setExchangeRate(currency, rate) {
  if (exchangeRates[currency] !== undefined && rate > 0) {
    exchangeRates[currency] = rate;
  }
}

export function getExchangeRates() {
  return { ...exchangeRates };
}

export function convertFromUsd(amountUsd, targetCurrency = 'PYG') {
  const rate = exchangeRates[targetCurrency] || 1;
  const converted = amountUsd * rate;
  
  if (targetCurrency === 'PYG') {
    return Math.round(converted / 1000) * 1000; // Clean Guaraníes rounding
  }
  return parseFloat(converted.toFixed(2));
}

export function convertToUsd(localAmount, sourceCurrency = 'PYG') {
  const rate = exchangeRates[sourceCurrency] || 1;
  return parseFloat((localAmount / rate).toFixed(2));
}

export function formatCurrency(amount, currency = 'USD') {
  if (currency === 'PYG') {
    return `₲ ${amount.toLocaleString('es-PY')}`;
  }
  if (currency === 'USDT' || currency === 'USD') {
    return `$ ${amount.toFixed(2)} USDT`;
  }
  return `${amount} ${currency}`;
}

export default {
  setExchangeRate,
  getExchangeRates,
  convertFromUsd,
  convertToUsd,
  formatCurrency
};
