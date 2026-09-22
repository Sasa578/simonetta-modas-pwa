# Guía de Sincronización y Configuración de Correos en Laptop
### Proyecto de Grado: PWA Simonetta Modas - Alta Costura a Medida

Esta guía contiene los pasos exactos y detallados para que puedas sincronizar tu rama `Laptop` con los últimos cambios de la rama `main` (PC), configurar el servicio de envío de correos electrónicos con **Nodemailer** y realizar las pruebas finales para la presentación y defensa de tu proyecto de grado.

---

## 📋 Resumen de lo que se preparó en la rama `main`

1. **Librería Instalada:** `nodemailer` integrada en el `package.json` del backend.
2. **Módulo de Correo (`backend/utils/emailService.js`):**
   - Plantillas de correo HTML con diseño formal atelier y colores institucionales de Simonetta Modas.
   - Envío de **Nota de Venta / Factura de Confección** al cliente con el archivo PDF adjunto.
   - Envío de **Reporte General del Taller** al Administrador con resumen de KPIs y PDF adjunto.
   - Función de diagnóstico y verificación de conexión SMTP (`verificarConexionTransporter`).
3. **Endpoints en Backend:**
   - `POST /api/reportes/taller/enviar-correo`: Envía el reporte mensual o del periodo al administrador.
   - `POST /api/reportes/pedido/:id/enviar-correo`: Envía el comprobante/nota de venta al correo del cliente.
   - `GET /api/reportes/verificar-correo`: Diagnóstico rápido de la conexión SMTP.
4. **Interfaz Web Actualizada (`ReportesView.jsx`):**
   - Botón **"✉️ Enviar al Admin"** en la cabecera de Reportes.
   - Botón **"✉️ Correo"** en cada fila de pedido para enviar la nota al cliente en un clic.
5. **Script de Prueba por Terminal (`backend/test_email.js`):**
   - Permite verificar la conexión SMTP y enviar un correo real con PDF adjunto en segundos.
6. **Plantilla de Entorno:** `backend/.env.example` con la estructura requerida.

---

## 🚀 PASO 1: Sincronizar en la Laptop desde `main` a la rama `Laptop`

Abre una terminal (PowerShell o Git Bash) en tu **Laptop** dentro de la carpeta del proyecto y ejecuta:

```bash
# 1. Asegúrate de estar en la raíz del proyecto
cd "P_Simonetta_modas"

# 2. Verifica el estado de tu repositorio local
git status

# (Opcional) Si tienes cambios locales sin guardar que no quieras perder:
# git stash

# 3. Cambia a tu rama Laptop
git checkout Laptop

# 4. Descarga las últimas actualizaciones del repositorio remoto en GitHub
git fetch origin

# 5. Fusiona los cambios de la rama main en tu rama Laptop
git merge origin/main

# 6. Verifica que estés al día
git log -n 3 --oneline
```

> [!NOTE]
> Al hacer el `merge origin/main`, tu rama `Laptop` recibirá los nuevos archivos de generación de PDFs, controladores, vistas y configuración de correos.

---

## 📦 PASO 2: Instalar Dependencias en el Backend de la Laptop

Dado que se agregó la librería `nodemailer`, debes instalarla en el entorno de tu laptop:

```bash
# Entra a la carpeta backend
cd backend

# Instala las dependencias actualizadas (incluye nodemailer)
npm install
```

---

## 🔑 PASO 3: Obtener la Contraseña de Aplicación de Gmail

Para enviar correos de manera segura y sin bloqueos desde Node.js, Google requiere una **Contraseña de Aplicación de 16 caracteres**. Sigue estos sencillos pasos:

1. Ingresa a tu cuenta de Google: [https://myaccount.google.com/](https://myaccount.google.com/)
2. Ve a la pestaña lateral izquierda: **Seguridad**.
3. Asegúrate de tener activada la **Verificación en 2 pasos**.
4. En el buscador de la parte superior de la cuenta de Google, escribe: **Contraseñas de aplicaciones** (o visita directamente: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)).
5. En el campo *Nombre de la app*, escribe: **Simonetta Modas**.
6. Haz clic en **Crear**.
7. Google te mostrará una clave de 16 letras amarillas (ejemplo: `abcd efgh ijkl mnop`).
8. **Copia esa contraseña** (la usaremos en el paso siguiente).

---

## ⚙️ PASO 4: Configurar el archivo `.env` en la Laptop

Abre el archivo `backend/.env` en tu laptop (o créalo a partir de `backend/.env.example` si no existe) y agrega las variables de correo:

```env
# ===================================================
# BASE DE DATOS Y JWT (Tus credenciales locales)
# ===================================================
DB_USER=postgres
DB_PASSWORD=tu_password_postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=simonetta_db
JWT_SECRET=simonetta_modas_jwt_secreto_2025
PUERTO=3000

# ===================================================
# CONFIGURACIÓN DE CORREO ELECTRÓNICO (GMAIL)
# ===================================================
EMAIL_SERVICE=gmail
EMAIL_USER=tu_correo_personal@gmail.com
EMAIL_PASS=abcdefghijklmnop
EMAIL_FROM="Simonetta Modas" <tu_correo_personal@gmail.com>
ADMIN_EMAIL=tu_correo_personal@gmail.com
```

> [!IMPORTANT]
> - En `EMAIL_PASS` pega la contraseña de 16 caracteres generada en el Paso 3 (puedes pegarla con o sin espacios).
> - En `EMAIL_USER` y `ADMIN_EMAIL` coloca tu correo Gmail donde deseas recibir las pruebas.

---

## 🧪 PASO 5: Probar el Envío de Correos

### Opción A: Prueba Rápida desde la Terminal (Recomendada)
Dentro de la carpeta `backend`, ejecuta el script de diagnóstico automático:

```bash
# 1. Probar solo la conexión SMTP:
node test_email.js

# 2. Probar el envío REAL con un PDF de prueba adjunto:
node test_email.js tu_correo@gmail.com
```

**Resultado esperado en consola:**
```text
✅ Conexión SMTP establecida y verificada exitosamente.
3. Enviando correo de prueba con PDF adjunto a: tu_correo@gmail.com...
✅ ¡CORREO ENVIADO CON ÉXITO!
   ID de Mensaje: <xxxxxxxx@gmail.com>
```
*Abre tu bandeja de entrada en Gmail y verás el correo formal de Simonetta Modas con el PDF adjunto.*

---

### Opción B: Prueba desde la Interfaz Web (Panel de Administración)

1. Inicia el servidor backend en una terminal:
   ```bash
   cd backend
   npm start
   ```
2. Inicia el frontend en otra terminal:
   ```bash
   cd frontend
   npm run dev
   ```
3. Ingresa a `http://localhost:5173/login` e inicia sesión como Administrador (`admin@simonettamodas.com` o tu usuario admin).
4. Ve a la sección **Reportes** en la barra superior.
5. Haz clic en el botón superior: **✉️ Enviar al Admin**.
   - Verás el estado `"⏳ Enviando..."` y luego `"✨ Reporte del taller (Septiembre 2026) enviado exitosamente..."`.
   - Revisa tu correo: recibirás el informe ejecutivo con la auditoría del taller y el PDF adjunto.
6. Ve a la pestaña **✂️ Pedidos & Confección**:
   - En cualquier pedido, haz clic en el botón azul **"✉️ Correo"**.
   - El sistema enviará la Nota de Venta al correo registrado del cliente con sus medidas, costurera y saldo pendiente en PDF.

---

## 🎓 PASO 6: Recomendaciones para la Presentación y Defensa

Durante la defensa de tu Proyecto de Grado, este módulo demuestra un alto nivel técnico y valor práctico para el negocio:

1. **Automatización Integral:** Explica que el taller ya no depende de libretas de papel. Cada pedido genera su comprobante inmutable con patronaje y medidas exactas.
2. **Generación de PDFs en Memoria:** Destaca que los reportes y facturas se crean en memoria con `pdfkit` (buffers binarios), lo cual ahorra almacenamiento en el servidor y optimiza la velocidad.
3. **Comunicación Transparente con el Cliente:** Muestra cómo el cliente puede tanto descargar su comprobante en PDF desde su panel como recibirlo automáticamente en su correo electrónico.
4. **Control Financiero Mensual:** Muestra cómo el Administrador recibe cada mes un balance con el desglose de ingresos en **Efectivo** vs **QR** y el control de cuentas por cobrar para cobranza efectiva.

---

*¡Todo el código backend y frontend ya está probado, compilado y sincronizado en `main` listo para tu merge en `Laptop`!*
