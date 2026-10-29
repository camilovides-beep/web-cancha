# 🏟️ web-cancha · Portal de Reservas (Comfasucre)

SPA del **Sistema de Reservas de Canchas** de la Caja de Compensación Familiar de
Sucre. Construida con **Angular 19** (componentes *standalone*, *signals* y *lazy
loading*) siguiendo **Atomic Design** y el **Manual de Marca Comfasucre 2025**.

> API (NestJS): repositorio **app-cancha**.

---

## 🚀 Puesta en marcha

### Desarrollo local

Requisitos: Node 22+.

```bash
npm install
npm start            # ng serve -> http://localhost:4200
```

En desarrollo apunta a la API local (`http://localhost:3000/api`). Asegúrate de
tener el backend corriendo.

### Con Docker

```bash
cp .env.example .env
docker build -t cancha-frontend .
```

Lo normal es levantarlo desde el `docker-compose.yml` del stack completo. La
imagen compila el proyecto y lo sirve con **nginx**, que además hace proxy de
`/api/` hacia el backend.

| Recurso | URL (Docker) |
|---------|--------------|
| **Portal público** | http://localhost:8080 |
| **Panel admin** | http://localhost:8080/login |

**Credenciales iniciales** del panel (seed del backend): `admin` / `Comfasucre2025*`.

---

## ⚙️ Configuración

La URL de la API se define en `src/environments/`:

| Entorno | Archivo | `apiUrl` |
|---------|---------|----------|
| Producción (Docker) | `environment.ts` | `/api` (proxy de nginx) |
| Desarrollo (`ng serve`) | `environment.development.ts` | `http://localhost:3000/api` |

Variables de despliegue (Docker/nginx) en `.env.example` → `.env`
(`FRONTEND_PORT`, `BACKEND_HOST`, `BACKEND_PORT`).

---

## 🧩 Arquitectura — Atomic Design

```
src/app/
├── core/        # Servicios, modelos, auth (guard, interceptor JWT)
├── ui/
│   ├── atoms/        # button, badge, spinner, logo, stat-tile
│   ├── molecules/    # page-header, empty-state
│   ├── organisms/    # sidebar, topbar
│   └── templates/    # admin-layout
└── pages/       # landing (público), login, dashboard, courts, reservations,
                 # users, settings, analytics
```

- Componentes **standalone**, **lazy loading** por ruta, estado con **signals**.
- Autenticación por **JWT** (guard de ruta + interceptor HTTP).

---

## 🎨 Imagen de marca

Branding según el **Manual de Marca Comfasucre 2025**: colores Pantone
(navy `#19559B`, azul `#1FB5E5`, verde `#94BD1F`), tipografía **Poppins**, logos
oficiales, degradado institucional, favicon e iconos PWA (assets en
`public/brand`). Los colores primario y secundario son editables en vivo desde
**Configuración**.

---

## 🧪 Pruebas y build

```bash
npm test             # pruebas unitarias (Karma + Jasmine)
npm run build        # build de producción -> dist/
```

---

## 🧱 Stack

Angular 19 · TypeScript 5.7 · RxJS · nginx (servido en producción).
