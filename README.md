# 🎮 GamesBoy.net

Plataforma y motor web independiente para **gamesboy.net**.

---

## 📁 Estructura del Proyecto

```
gamesboy/
├── .env.example                # Variables de entorno y credenciales de DB
├── .env                        # Configuración activa local
├── Dockerfile                  # Contenedor de producción
├── package.json                # Dependencias (Express, pg, mysql2, ws, helmet, cors)
├── server/
│   ├── index.js                # Servidor principal HTTP + WebSockets
│   ├── config/
│   │   ├── env.js              # Carga de variables de entorno
│   │   └── database.js         # Capa de conexión (PostgreSQL / MySQL con fallback)
│   ├── routes/
│   │   ├── api.js              # Endpoints principales de la API
│   │   └── health.js           # Monitor de salud, uptime y memoria
│   └── middleware/
│       └── errorHandler.js     # Manejador de errores
├── client/
│   ├── index.html              # Interfaz y dashboard del sistema
│   ├── css/
│   │   └── main.css            # Sistema de diseño gamer dark & glassmorphism
│   └── js/
│       └── app.js              # Conectividad en tiempo real y diagnóstico
└── docs/
    └── GODADDY_DOMAIN_SETUP.md # Guía para vincular el dominio de GoDaddy
```

---

## 🚀 Inicio Rápido

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar en modo desarrollo:**
   ```bash
   npm run dev
   ```

3. **Abrir en el navegador:**
   - Web: [http://localhost:3000](http://localhost:3000)
   - Diagnóstico: [http://localhost:3000/health](http://localhost:3000/health)
