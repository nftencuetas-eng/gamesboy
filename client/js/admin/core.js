/**
 * ==============================================================================
 * GAMESBOY STUDIO — ADMIN CORE (client/js/admin/core.js)
 * Architecture: Phase 1 Modular Foundation
 * Responsibility: Central administrative namespace, state contract & helpers.
 * ==============================================================================
 */

window.GamesBoyAdmin = window.GamesBoyAdmin || {
  version: '1.0.0',
  state: {
    exchangeRate: 7500,
    currentUser: null,
    activeTab: 'tab-overview'
  },
  modules: {},
  events: new EventTarget(),
  
  /**
   * Register a domain module into the Admin Studio
   */
  registerModule(name, moduleDefinition) {
    if (this.modules[name]) {
      console.warn(`[AdminCore] El módulo "${name}" ya está registrado.`);
      return;
    }
    this.modules[name] = moduleDefinition;
  },

  /**
   * Get authenticated headers for administrative API requests
   */
  getAuthHeaders() {
    const token = localStorage.getItem('gb_token');
    const adminSessionRaw = localStorage.getItem('gb_admin_session');
    let adminUserId = 'usr_admin';
    if (adminSessionRaw) {
      try {
        const parsed = JSON.parse(adminSessionRaw);
        if (parsed && parsed.id) adminUserId = parsed.id;
      } catch (e) {}
    }
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'x-admin-token': token || '',
      'x-user-id': adminUserId,
      'Content-Type': 'application/json'
    };
  }
};
