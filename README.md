# Simonetta Modas - Sistema de Gestión 👗

Este es el sistema integral de gestión para el taller de alta costura "Simonetta Modas". El sistema cuenta con roles para el Administrador, Secretaría, Costureras y Clientes, y está dividido en dos partes principales: un Backend (Node.js + PostgreSQL) y un Frontend PWA (React.js + Vite).

## ✨ Características Principales y Últimas Actualizaciones

- **Dashboard de Administración y Secretaría**: Gestión dinámica de pedidos, clientes y operarios.
- **Flujo de Trabajo para Costureras**: Panel táctil y móvil para reportar avance en tiempo real, desde *Corte* hasta *Para Entregar*.
- **Control Financiero**: Gestión de costos totales, pagos por adelantado (adelantos) y cobro automatizado de **saldos** finales en la entrega de prendas.
- **Diseño UI/UX Premium**: Modales con efecto *Glassmorphism* (backdrop blur), esquinas redondeadas, alertas semánticas y paleta de colores cuidada corporativamente.
- **Perfiles Extensivos**: Los usuarios (costureras, clientes, etc.) poseen fichas de contacto ampliadas (Nombre Completo, CI, Teléfono) visibles directamente en sus vistas móviles y de perfil.
- **Notificaciones Push**: Integración con Firebase (FCM) para enviar notificaciones automáticas ante el cambio de estado de los pedidos y en la entrega de prendas.

---

## 🚀 Requisitos Previos

Para ejecutar este proyecto en otro equipo, necesitarás tener instalado lo siguiente:

1. **[Node.js](https://nodejs.org/es/)** (Versión 18 o superior recomendada).
2. **[PostgreSQL](https://www.postgresql.org/download/)** (Para la base de datos).
3. **Git** (Para clonar el repositorio).

---

## 🛠️ Instrucciones de Instalación y Despliegue

### 1. Clonar el Repositorio

Abre una terminal y ejecuta el siguiente comando para descargar el código fuente:

```bash
git clone <URL_DE_TU_REPOSITORIO_EN_GITHUB>
cd P_Simonetta_modas
```

### 2. Configurar la Base de Datos

1. Abre pgAdmin o tu terminal de PostgreSQL.
2. Crea una nueva base de datos vacía llamada `simonetta_db` (o el nombre que prefieras).
3. Dentro de la carpeta `backend`, abre el archivo `.env` (si no existe, crea uno nuevo basado en las variables a continuación) y configura tus credenciales locales:

```env
DB_USER=postgres
DB_PASSWORD=tu_contraseña_aqui
DB_HOST=localhost
DB_PORT=5432
DB_NAME=simonetta_db
JWT_SECRET=una_clave_secreta_muy_segura
```

4. **Ejecutar Migraciones:** Para construir las tablas de la base de datos de manera automática, entra en la carpeta del backend y ejecuta el script de migración:
```bash
cd backend
npm install
node db/migrate.js
node db/init.js  # (Si existe un script de inicialización de roles y admin)
```

### 3. Iniciar el Backend (Servidor API)

Con la base de datos lista y dentro de la carpeta `backend`, instala las dependencias y corre el servidor:

```bash
npm install
npm run dev
```
> El servidor backend normalmente se ejecutará en `http://localhost:3000`.

### 4. Iniciar el Frontend (Aplicación Web React)

Abre **otra ventana de terminal**, navega a la carpeta del frontend, instala dependencias e inícialo:

```bash
cd ../frontend
npm install
npm run dev
```
> La aplicación frontend de Vite se ejecutará generalmente en `http://localhost:5173`. Abre esta URL en tu navegador para usar el sistema.

---

## 📱 Notificaciones Push (Firebase)
Si planeas utilizar las notificaciones, recuerda colocar tu archivo de claves de servicio `firebase-service-account.json` en la ruta correspondiente del backend.

## 🤝 Soporte
Si encuentras algún problema instalando dependencias (especialmente con problemas de caché), ejecuta:
`npm cache clean --force`
Y vuelve a intentar `npm install`.
