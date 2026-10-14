# 🛡️ GamesBoy.net - Master Engineering & Architecture Rules

This document establishes the architectural standards, security policies, and engineering best practices for the **GamesBoy.net** platform.

---

## 1. Single Responsibility Principle (SRP) & Clean Architecture
- **Single Responsibility**: Every module, route, middleware, model, and client component must have a single, well-defined responsibility.
  - `server/config/`: Environment and database connections only.
  - `server/middleware/`: Request validation, security, and authentication only.
  - `server/routes/`: Route handling and HTTP request/response orchestration only.
  - `server/services/`: Business logic, currency calculations, and credential encryption.
  - `server/models/`: Database queries and data persistence.
  - `client/js/services/`: API communication, state management, and wallet operations.
  - `client/js/components/`: Reusable UI elements (modals, cards, badges, tables).

---

## 2. Security & Data Protection (Armored Standards)
- **Credential Encryption**: Account credentials (passwords, PINs, auth tokens) must never be stored or transmitted in plain text. Always encrypt with AES-256 before saving to the database.
- **Role-Based Access Control (RBAC)**:
  - `CLIENT`: Browse, deposit funds, purchase slots, view owned credentials.
  - `SELLER`: Publish slots, view occupied slots, request payouts.
  - `ADMIN`: Approve deposits, execute payouts, change platform commissions and exchange rates, resolve disputes.
- **Financial Integrity**:
  - Balance updates (deposits, purchases, escrow holds, releases, withdrawals) must be atomic and logged in an immutable ledger (`gamesboy_wallet_transactions`).
  - No negative balances allowed.
  - Prevent double-spending through database transactions and status checks.
- **Input Sanitization**: Validate and sanitize all user inputs (comprobantes, prices, slot counts, text fields) to prevent XSS and injection attacks.

---

## 3. UI/UX Design System (100% Dark Mode & Minimalist)
- **Zero Neon**: No glowing bloom shadows, no saturated cyan/magenta neon outlines, no CRT filters.
- **Matte Charcoal & Dark Slate**: Base `#0a0c10`, surface elevated `#11141c`, `#181c26`.
- **Clean Typography**: Inter / Outfit for headings and body, JetBrains Mono for monetary values, PINs, and codes.
- **Multi-Currency Clarity**: Always display base currency (USDT / USD) alongside converted local currency (₲ Guaraníes) with a clear exchange rate indicator.

---

## 4. Obligación de Despliegue Continuo (Deploy on Complete)
- **Despliegue Mandatorio Inmediato**: Al concluir cualquier tarea, corrección de errores, refactorización o fase operativa, el agente TIENE LA OBLIGACIÓN ESTRICTA de ejecutar el despliegue automático hacia producción.
- **Ciclo Incompleto sin Deploy**: Ninguna tarea o requerimiento se considerará finalizado si los cambios no han sido confirmados en Git y enviados (`git push`) al repositorio remoto (`origin/main`), garantizando la activación automática del build en **Railway**.
- **Protocolo de Ejecución de Deploy**:
  1. Verificar la integridad y pruebas locales pertinentes.
  2. Ejecutar `node scripts/deploy_git.js` para registrar (`stage`), hacer commit descriptivo y realizar el `push` inmediato a la rama `main` en GitHub (`https://github.com/nftencuetas-eng/gamesboy.git`).
  3. Confirmar que el trigger de despliegue en Railway se haya disparado satisfactoriamente antes de dar por cerrada la intervención.

