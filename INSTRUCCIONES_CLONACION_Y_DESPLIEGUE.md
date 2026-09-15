# 📋 Guía Completa de Clonación, Configuración y Despliegue Local
## Sistema Web Progresivo (PWA) — Simonetta Modas
**Proyecto de Grado — Escuela Militar de Ingeniería (EMI)**

Esta guía detalla el procedimiento paso a paso para clonar, configurar, inicializar y ejecutar el sistema **Simonetta Modas** en una laptop o equipo secundario desde GitHub, garantizando un despliegue exitoso para la presentación y defensa ante el tribunal docente.

---

## 📌 1. Requisitos Previos en la Laptop

Antes de comenzar, asegúrate de tener instalado el siguiente software en tu laptop con Windows (o el sistema operativo que uses):

1. **Git for Windows**:
   - Descarga e instala desde: [git-scm.com](https://git-scm.com/)
   - Verifica en terminal: `git --version`
2. **Node.js (LTS v18, v20 o v22)**:
   - Descarga e instala la versión recomendada (LTS) desde: [nodejs.org](https://nodejs.org/)
   - Verifica en terminal: `node -v` y `npm -v`
3. **PostgreSQL (v14, v15, v16 o v17)**:
   - Descarga e instala desde: [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
   - Durante la instalación, anota la **contraseña del superusuario `postgres`** (generalmente `postgres` o tu contraseña habitual).
   - Asegúrate de que el servicio de PostgreSQL esté en ejecución (puerto por defecto: `5432`).
4. **Navegador Web Moderno**:
   - Google Chrome, Microsoft Edge o Brave (recomendados por su compatibilidad con PWA, Service Workers y herramientas de emulación móvil).

---

## 🚀 2. Clonación del Repositorio desde GitHub

Abre una ventana de **Terminal (PowerShell o Git Bash)** en la carpeta donde desees almacenar el proyecto (por ejemplo en `C:\Proyectos` o `Documentos`):

```bash
# 1. Clonar el repositorio oficial
git clone https://github.com/Sasa578/simonetta-modas-pwa.git

# 2. Entrar a la carpeta del proyecto
cd simonetta-modas-pwa
```

---

## 📦 3. Instalación de Dependencias

El sistema consta de dos módulos principales: **Backend** (API Express + PostgreSQL + Socket.io) y **Frontend** (React + Vite + PWA). Se deben instalar las dependencias en ambos:

### A. Dependencias del Backend:
```bash
cd backend
npm install
```

### B. Dependencias del Frontend:
Abre otra pestaña de terminal o regresa a la raíz y entra al frontend:
```bash
cd ../frontend
npm install
```

---

## 🗄️ 4. Configuración de Base de Datos y Variables de Entorno

### A. Crear la Base de Datos en PostgreSQL
Abre **pgAdmin 4** o la consola **SQL Shell (psql)** y ejecuta el comando para crear la base de datos:

```sql
CREATE DATABASE simonetta_db;
```

### B. Crear el archivo de Variables de Entorno (`.env`)
Dentro de la carpeta `backend/`, crea un archivo llamado exactamente `.env` (sin extensión adicional). Puedes crearlo con el Bloc de Notas, VS Code o ejecutando en PowerShell:

```bash
# Estando dentro de la carpeta backend/
notepad .env
```

Copia y pega el siguiente contenido en el archivo `backend/.env`:

```env
# Configuración del Servidor Express
PUERTO=3000

# Conexión a PostgreSQL (Ajusta la contraseña si usaste otra al instalar PostgreSQL)
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=simonetta_db

# Clave secreta para generación de Tokens JWT
JWT_SECRET=simonetta_modas_jwt_secreto_2025
```

> ⚠️ **Importante**: Si al instalar PostgreSQL en tu laptop asignaste una contraseña distinta para el usuario `postgres` (por ejemplo `admin`, `1234`, etc.), reemplaza el valor de `DB_PASSWORD` con esa contraseña exacta.

---

## 🌱 5. Inicialización de Esquema y Carga de Datos Demo

Para que el tribunal y los docentes vean el sistema completamente funcional con datos realistas (pedidos, clientes, telas, fichas de medidas, citas, kardex y facturas), ejecuta los siguientes scripts en orden dentro de la carpeta `backend/`:

```bash
cd backend

# Paso 1: Crear las 36 tablas relacionales y restricciones (DDL)
node db/inicializar.js

# Paso 2: Sembrar roles, permisos, cuentas de personal y clientes base
node db/semilla.js

# Paso 3: Cargar telas, hilos, botones y materiales de almacén
node scripts/cargar_insumos_demo.js

# Paso 4: Cargar pedidos con medidas anatómicas, citas y pagos
node scripts/cargar_pedidos_demo.js

# Paso 5: Cargar proveedores, kardex de movimientos y notas de venta
node scripts/cargar_kardex_demo.js
```

### 💡 Atajo en PowerShell (Ejecutar todo en 1 solo comando):
Si estás usando PowerShell en Windows, puedes ejecutar todo en una sola línea:
```powershell
node db/inicializar.js; node db/semilla.js; node scripts/cargar_insumos_demo.js; node scripts/cargar_pedidos_demo.js; node scripts/cargar_kardex_demo.js
```

Al finalizar, verás mensajes con `✅` confirmando la carga de cada módulo.

---

## 🧪 6. Verificación de Pruebas Automatizadas (Para Demostración Técnica)

Para demostrar a los docentes de sistemas la calidad de software y el aseguramiento de pruebas unitarias/integración:

```bash
# Estando en la carpeta backend/
npm test
```

**Resultado esperado:**
- `Test Suites: 4 passed, 4 total`
- `Tests: 14 passed, 14 total` (100% de éxito en Autenticación, Usuarios, Pedidos y Kardex).

---

## ▶️ 7. Puesta en Marcha del Sistema (Ejecución)

Para presentar el sistema necesitarás dos terminales abiertas:

### Terminal 1: Servidor Backend (API REST + WebSockets)
```bash
cd simonetta-modas-pwa/backend
npm start
```
*Verás: `🟢 Servidor backend corriendo en http://localhost:3000`*

### Terminal 2: Servidor Frontend (React + Vite PWA)
```bash
cd simonetta-modas-pwa/frontend
npm run dev
```
*Verás: `➜ Local: http://localhost:5173/` y `➜ Network: http://[tu-ip]:5173/`*

---

## 🔑 8. Credenciales de Acceso para la Presentación

Puedes iniciar sesión con cualquiera de los siguientes perfiles preconfigurados según la etapa de la demostración que desees presentar:

| Rol | Correo Electrónico | Contraseña | Funcionalidad Clave a Mostrar |
| :--- | :--- | :--- | :--- |
| **Administradora** | `admin@simonetta.com` | `admin123` | Visión gerencial total, Gestión de Usuarios, Catálogos de Almacén, Control de Kardex, Notas de Venta con Descuentos, y Dashboard de Pruebas en `/admin/pruebas`. |
| **Secretaría** | `secretaria@simonetta.com` | `secre123` | Recepción de pedidos, toma de medidas anatómicas (12 puntos), agendamiento de citas de prueba, cobro de saldos y entrega de prendas. |
| **Costurera** | `costurera1@simonetta.com` | `costu123` | Interfaz móvil simplificada de taller: avance de estados de confección (`Pendiente` ➔ `Corte` ➔ `Armado` ➔ `Acabados`) y consulta de medidas de clientes. |
| **Cliente (PWA)** | `cliente@simonetta.com` | `cliente123` | Seguimiento de pedidos en tiempo real, consulta de medidas anatómicas vigentes e historial de pedidos. |
| **Cliente VIP** | `lucia.mendoza@email.com` | `cliente123` | Cliente con categoría especial (descuento del 10% automático en notas de venta). |

---

## 📱 9. Demostración en Dispositivo Móvil (Smartphone Real)

Simonetta Modas es una **PWA (Progressive Web App)** diseñada para funcionar como aplicación nativa en celulares. Para sorprender al tribunal docente mostrando el sistema en tu propio celular:

1. **Conecta tu laptop y tu celular a la misma red Wi-Fi** (o comparte internet desde el celular a la laptop como zona Wi-Fi).
2. En tu laptop, abre PowerShell y escribe:
   ```bash
   ipconfig
   ```
   Busca la **Dirección IPv4** del adaptador Wi-Fi (ejemplo: `192.168.1.15` o `192.168.43.120`).
3. En el navegador de tu celular (Google Chrome en Android o Safari en iPhone), ingresa a:
   ```
   http://192.168.1.15:5173
   ```
   *(Reemplaza con la IP real de tu laptop)*.
4. **Instalación como App Nativa**:
   - En Chrome (Android): Toca los 3 puntos verticales y selecciona **"Agregar a la pantalla principal"** o **"Instalar aplicación"**.
   - En Safari (iOS): Toca el botón de Compartir y selecciona **"Agregar al inicio"**.
5. Abre la aplicación desde el icono en la pantalla de tu celular e inicia sesión como **Costurera** (`costurera1@simonetta.com`) o como **Cliente**.
6. Mientras tanto, en la pantalla de la laptop (proyectada al tribunal) mantén la vista de **Administradora** o **Secretaría**. Al cambiar de estado un pedido en el celular, verás cómo se sincroniza en tiempo real.

---

## 🛠️ 10. Solución de Problemas Frecuentes en Windows

### A. Error: "password authentication failed for user postgres"
- **Causa**: La contraseña configurada en el archivo `backend/.env` no coincide con la contraseña asignada al instalar PostgreSQL.
- **Solución**: Abre `backend/.env` y cambia `DB_PASSWORD` por la contraseña correcta.

### B. Error: "La ejecución de scripts está deshabilitada en este sistema" (PowerShell)
- **Causa**: Política de seguridad de ejecución de PowerShell en Windows.
- **Solución**: Abre PowerShell como Administrador y ejecuta:
  ```powershell
  Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
  ```
  Luego vuelve a ejecutar tus comandos `npm`.

### C. Error: "Port 3000 (o 5173) already in use"
- **Causa**: Ya hay una instancia previa corriendo en segundo plano.
- **Solución**: En PowerShell ejecuta:
  ```powershell
  Get-Process node | Stop-Process -Force
  ```
  Y vuelve a lanzar `npm start` o `npm run dev`.

### D. El celular no puede abrir la URL de la laptop
- **Causa**: El Firewall de Windows está bloqueando las conexiones entrantes en los puertos 3000 y 5173.
- **Solución rápida para la presentación**:
  1. Abre el menú Inicio de Windows y busca **"Firewall de Windows Defender"**.
  2. Haz clic en "Permitir que una aplicación o una característica a través del Firewall".
  3. Asegúrate de que **Node.js JavaScript Runtime** tenga marcadas las casillas de red **Privada**.
  4. O temporalmente desactiva el Firewall en redes privadas durante la defensa académica.

---

## 🎯 11. Resumen de Flujo para la Defensa ante el Tribunal

1. **Introducción Teórica**:
   - Explicación de la arquitectura por capas y la normalización de la base de datos en 3FN (36 tablas).
   - Mencionar el archivo `INFORME_TECNICO_SISTEMA_Y_PRUEBAS.md` incluido en el repositorio, donde está todo el marco teórico y de pruebas.
2. **Dashboard de Pruebas de Calidad**:
   - Iniciar sesión como Administradora y navegar a: `http://localhost:5173/admin/pruebas`
   - Mostrar la ejecución en vivo de los tests automatizados de Jest ante los docentes.
3. **Demostración Práctica del Flujo de Negocio**:
   - **Secretaría**: Registra un nuevo pedido para un cliente, toma sus medidas anatómicas y define un adelanto.
   - **Costurera (en el celular o vista móvil)**: Recibe el pedido asignado, revisa las medidas anatómicas y avanza los estados de corte y armado.
   - **Administradora**: Monitorea el inventario en el Almacén, revisa el Kardex de movimientos y emite la Nota de Venta correspondiente.
