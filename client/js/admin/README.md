# 🛡️ GamesBoy Admin Studio — Arquitectura de Modularización JS

Este directorio establece la arquitectura para la extracción progresiva y por dominios del monolito JavaScript administrativo de `client/admin.html` (Fase 1 Foundation).

---

## 1. Mapa de Dominios & Módulos

| Módulo Archivo | Dominio Funcional | Pestañas Administradas | Dependencias Principales |
|---|---|---|---|
| `core.js` | Namespace Global & Auth | Todas (01-13) | `localStorage: gb_token, gb_admin_session` |
| `dashboard.js` | Métricas & Resumen Ejecutivo | `tab-overview` (01) | `/api/admin/overview`, WebSocket alerts |
| `orders.js` | Despacho Digital & SMM | `tab-orders-delivery` (02), `tab-smm-orders` (03) | `/api/admin/orders`, `/api/admin/smm-orders` |
| `catalog.js` | Catálogo de Juegos, Keys & Gift Cards | `tab-games-management` (04), `tab-giftcards-management` (05), `tab-work-tools` (10) | `/api/admin/games`, `/api/admin/giftcards`, `/api/admin/work-tools` |
| `streaming.js` | Moderación de Cuentas & Hubs | `tab-streaming-moderation` (06) | `/api/streaming-hubs`, `/api/admin/subscriptions` |
| `customers.js` | Directorio de Clientes & Soporte IA | `tab-users` (07), `tab-ai-whatsapp` (08) | `/api/admin/users`, `/api/ai-support/admin/*` |
| `settings.js` | Portadas Hero, SIPAP & Marca Blanca | `tab-hero-banners` (09), `tab-tenant-settings` (13) | `/api/banners/admin`, `/api/saas/tenants/*` |
| `finance.js` | Depósitos Bancarios & Payouts | `tab-finance` (11), `tab-custody-payouts` (12) | `/api/admin/deposits`, `/api/admin/payouts` |

---

## 2. Contrato de Estado Global (`window.GamesBoyAdmin`)

```javascript
window.GamesBoyAdmin = {
  version: '1.0.0',
  state: {
    exchangeRate: 7500,     // Sincronizado dinámicamente con db.platform_settings
    currentUser: null,      // Sesión activa del administrador validada
    activeTab: 'tab-overview' // ID de la pestaña activa en el panel
  },
  modules: {},              // Registro de sub-módulos inicializados
  events: new EventTarget(),// Event bus para sincronización reactiva (e.g. WebSocket)
  getAuthHeaders()          // Inyector de cabeceras seguras Bearer + x-admin-token
};
```

---

## 3. Protocolo de Extracción Progresiva (Sin Downtime)

1. **Fase 1 (Completada)**:
   - Se crea la estructura de directorios y los stubs documentados.
   - Se añade el interceptor transparente en `client/admin.html` para asegurar que todas las llamadas a `/api/admin/*`, `/api/banners/admin`, `/api/ai-support/admin/*` y `/api/saas/tenants/*` lleven el token HMAC de servidor.
2. **Fase 2 (Próxima fase)**:
   - Extracción de módulos de menor acoplamiento primero: `orders.js`, `settings.js` y `finance.js`.
   - Pruebas E2E de validación de carga y eventos WebSocket.
3. **Fase 3**:
   - Extracción de `catalog.js`, `streaming.js` y `customers.js`.
   - Conversión de modales pesados a Drawers laterales con componentes reutilizables.
