# 🌐 Configuración del Dominio GamesBoy.net en GoDaddy

Esta guía te explica paso a paso cómo vincular tu dominio **gamesboy.net** (registrado en GoDaddy) con tu servidor de producción (VPS, Railway, Render, etc.).

---

## 1. Encontrar la IP o CNAME de tu Servidor
- **Si usas un VPS / Servidor Dedicado**: Copia la dirección **IP Pública IPv4** (ej: `123.45.67.89`).
- **Si usas Plataformas Cloud (Railway / Render / Fly.io)**: Obtendrás un dominio de destino CNAME (ej: `gamesboy-production.up.railway.app`).

---

## 2. Configurar Registros DNS en GoDaddy
1. Inicia sesión en [GoDaddy](https://www.godaddy.com/).
2. Ve a **Mis Productos** > Busca **gamesboy.net** > Haz clic en **DNS** o **Administrar DNS**.
3. Añade o edita los siguientes registros en la **Zona DNS**:

### Opción A: Servidor con IP Fija (VPS / Ubuntu / Nginx)
| Tipo | Nombre | Valor / Datos | TTL |
|------|--------|---------------|-----|
| **A** | `@` | `TU_IP_DEL_SERVIDOR` (ej: `123.45.67.89`) | 1/2 hora (600s) |
| **CNAME** | `www` | `@` o `gamesboy.net` | 1/2 hora |

### Opción B: Plataformas con CNAME (Railway, Render, Vercel)
| Tipo | Nombre | Valor / Datos | TTL |
|------|--------|---------------|-----|
| **CNAME** | `www` | `tu-app.up.railway.app` | 1/2 hora |
| **A / Redirección** | `@` | Configura el redireccionamiento de dominio en GoDaddy de `@` a `https://www.gamesboy.net` o el registro ALIAS/ANAME según tu proveedor |

---

## 3. Certificado SSL / HTTPS
- Si utilizas **Cloudflare** o **Railway / Render**, el certificado SSL (HTTPS) se emite automáticamente de forma gratuita.
- Si utilizas tu propio servidor con **Nginx**, puedes generar el certificado gratuito con **Certbot (Let's Encrypt)**:
  ```bash
  sudo certbot --nginx -d gamesboy.net -d www.gamesboy.net
  ```

---

## 4. Verificación de Propagación
Puedes verificar el estado de propagación global del DNS en:
- [whatsmydns.net/#A/gamesboy.net](https://www.whatsmydns.net/#A/gamesboy.net)
