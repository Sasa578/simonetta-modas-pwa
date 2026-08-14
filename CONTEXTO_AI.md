# Contexto del Proyecto: Simonetta Modas PWA

Este archivo está diseñado para dar contexto rápido a cualquier asistente de IA que se una al proyecto en un nuevo entorno.

## 🎯 Objetivo General
Simonetta Modas es un sistema PWA (Progressive Web App) construido con **React + Vite** (Frontend) y **Node.js + Express + PostgreSQL** (Backend). 
Su objetivo es digitalizar un taller de alta costura, manejando inventarios, flujos de trabajo de pedidos, toma de medidas, finanzas (adelantos y saldos) y notificaciones a clientes.

## 👥 Roles del Sistema
1. **Administradora**: Visión total. KPIs, ganancias, creación de usuarios.
2. **Secretaría**: Recepción de clientes, toma de medidas preliminares, gestión del calendario de citas, cobro de saldos y entrega de prendas.
3. **Costurera**: Panel móvil simplificado para avanzar estados del pedido (Corte -> Armado -> Acabados -> Para Entregar).
4. **Cliente**: Vista PWA donde pueden ver sus pedidos en proceso, sus medidas guardadas y su historial.

## 🛠️ Lo que hemos logrado (Hasta la fecha actual)

### 1. Reestructuración de Base de Datos y Modelos
- Se migró de usar `DATABASE_URL` a variables de entorno tradicionales (`DB_USER`, `DB_PASSWORD`, etc.) usando `pg.Pool` para evitar problemas de parseo en Windows.
- Se actualizaron las tablas `usuarios` y `clientes` para incluir campos obligatorios: `nombre_completo`, `carnet_identidad`, y `telefono`.
- El inicio de sesión (`authController.js`) ahora adjunta `nombre_completo` y `telefono` para que las operarias también vean sus propios datos en la pestaña de su "Perfil".

### 2. Flujo Financiero y de Estados ("Para Entregar")
- **Problema anterior**: Las costureras marcaban "Finalizar Prenda" y el pedido quedaba como Terminado directamente, sin control del pago final.
- **Solución Actual**: La costurera ahora pulsa **"Pasar a Secretaría"**, lo que pone el pedido en estado `Para Entregar`.
- **Cobro**: La Secretaria tiene un botón en su panel para pedidos `Para Entregar`. Al usarlo, se abre el `ModalEntrega.jsx`, que muestra Costo, Adelanto y **Saldo Pendiente**. Al cobrar, el saldo pasa a `0`, el adelanto se iguala al costo total, el estado pasa a `Entregado` y se envía una notificación Push (Firebase) de agradecimiento al cliente.

### 3. UI / UX Premium
- Se rediseñaron los componentes `ModalUsuario.jsx`, `ModalCliente.jsx` y `ModalEntrega.jsx` siguiendo un estándar "Pro Max":
  - Efectos de *Backdrop blur* en los superpuestos.
  - Esquinas más redondeadas (16px), fondos blancos limpios con sombras dinámicas.
  - Campos de input estilizados (padding espacioso, backgrounds sutiles, fuentes contrastantes).
  - Estructura limpia y semántica (Vanilla CSS puro, sin Tailwind, por decisión de diseño).

## 🚀 Siguientes Pasos (Para el próximo entorno/sesión)
- **Despliegue o Testing en red local**: Revisar que la PWA y las notificaciones en el celular funcionen en un servidor local por Wi-Fi (IP compartida).
- **Notificaciones Push FCM**: Asegurarse de que el archivo `firebase-service-account.json` esté configurado en el nuevo dispositivo para que las notificaciones funcionen.
- Continuar mejorando los Dashboards (KPIs de Administradora, visualización de métricas y ganancias que estaban pendientes).

## 💡 Notas Técnicas
- El proyecto NO usa ORMs como Prisma/Sequelize. Todo es SQL puro con el paquete `pg` en la carpeta `backend/models`.
- Para arrancar en el nuevo PC, ejecuta `npm install` en ambas carpetas.
- Revisa el archivo `.env` en el backend para asegurarte de que las credenciales coinciden con el PostgreSQL local del nuevo PC.
