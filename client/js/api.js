/**
 * GAMESBOY.NET - CENTRAL API CLIENT & CURRENCY UTILITIES
 */

const API_BASE = '';
let currentCurrency = localStorage.getItem('gamesboy_currency') || 'USD';
let exchangeRatePyg = 7800;

export const API = {
  getToken() {
    return localStorage.getItem('gamesboy_token');
  },

  setToken(token) {
    if (token) localStorage.setItem('gamesboy_token', token);
    else localStorage.removeItem('gamesboy_token');
  },

  getUser() {
    try {
      return JSON.parse(localStorage.getItem('gamesboy_user') || 'null');
    } catch {
      return null;
    }
  },

  setUser(user) {
    if (user) localStorage.setItem('gamesboy_user', JSON.stringify(user));
    else localStorage.removeItem('gamesboy_user');
  },

  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Error ${response.status}: ${response.statusText}`);
      }
      return data;
    } catch (err) {
      console.error(`[API Error ${endpoint}]:`, err.message);
      throw err;
    }
  },

  // Auth
  async login(email, password) {
    const res = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.token) {
      this.setToken(res.token);
      this.setUser(res.user);
    }
    return res;
  },

  async register(payload) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getProfile() {
    return this.request('/api/auth/me');
  },

  logout() {
    this.setToken(null);
    this.setUser(null);
    window.location.href = '/login';
  },

  // Catalog
  async getCategories() {
    return this.request('/api/categories');
  },

  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/products?${query}`);
  },

  async getProduct(idOrSlug) {
    return this.request(`/api/products/${idOrSlug}`);
  },

  // Admin
  async getAdminMetrics() {
    return this.request('/api/admin/metrics');
  },

  async getAdminUsers() {
    return this.request('/api/admin/users');
  },

  async getAdminSettings() {
    return this.request('/api/admin/settings');
  },

  async approveDeposit(payload) {
    return this.request('/api/admin/deposits/approve', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};

// Currency Formatting
export function formatCurrency(amountUsd, amountPyg = null) {
  const usdVal = Number(amountUsd) || 0;
  const pygVal = amountPyg !== null ? Number(amountPyg) : Math.round(usdVal * exchangeRatePyg);

  if (currentCurrency === 'PYG') {
    return `₲ ${pygVal.toLocaleString('es-PY')}`;
  }
  return `$${usdVal.toFixed(2)} USD`;
}

export function formatDualCurrency(amountUsd, amountPyg = null) {
  const usdVal = Number(amountUsd) || 0;
  const pygVal = amountPyg !== null ? Number(amountPyg) : Math.round(usdVal * exchangeRatePyg);

  return {
    primary: `$${usdVal.toFixed(2)} USD`,
    secondary: `₲ ${pygVal.toLocaleString('es-PY')}`
  };
}

export function setCurrency(currency) {
  currentCurrency = currency;
  localStorage.setItem('gamesboy_currency', currency);
  window.dispatchEvent(new CustomEvent('currency-changed', { detail: { currency } }));
}

export function getCurrency() {
  return currentCurrency;
}
