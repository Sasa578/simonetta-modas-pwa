# Contexto del Proyecto: Simonetta Modas PWA (v2.0.0)

Este archivo proporciona contexto técnico inmediato a cualquier asistente de IA que se una al proyecto en un nuevo entorno o máquina para continuar el desarrollo o la documentación académica.

---

## 🎯 Objetivo General
**Simonetta Modas** es un sistema Progresivo Web (PWA) construido con **React + Vite** (Frontend) y **Node.js + Express + PostgreSQL 16** (Backend). 
Digitaliza de forma integral un taller de alta costura, abarcando:
1. **Seguridad y Usuarios:** Control de acceso basado en roles (RBAC) con particionamiento vertical y subtipos de cliente (`Persona` vs `Institucional`).
2. **Almacén e Inventario:** Catálogos paramétricos normalizados y especificaciones polimórficas (telas, botones, hilos, cierres).
3. **Pedidos, Medidas, Citas y Pagos:** Transacción atómica de pedidos maestro-detalle, medidas anatómicas 1:1 por prenda, anticipos y pagos fraccionados (abonos).
4. **Kardex, Reportes y Notas de Venta:** Auditoría transaccional de inventario con distinción de origen (`Taller` vs `Cliente`), emisión inmutable de notas de venta con descuentos parametrizados.

---

## 👥 Roles del Sistema
1. **Administradora (`Admin`):** Visión total. Auditoría Kardex, inventarios, notas de venta, gestión de personal, finanzas y pruebas automatizadas.
2. **Secretaría (`Secretaria`):** Recepción de clientes, toma de medidas, agenda interactiva de citas, cobro de saldos, entrega de prendas e insumos.
3. **Costurera (`Costurera`):** Panel móvil PWA simplificado (`/mobile`) para consultar fichas técnicas, medidas y avanzar el flujo de confección (Corte -> Armado -> Prueba -> Terminado).
4. **Cliente (`Cliente`):** Portal exterior PWA para seguimiento en tiempo real del estado de su confección, catálogo y medidas.

---

## 🏗️ Arquitectura y Base de Datos (3FN)
- **Tecnología:** PostgreSQL 16 puro con `pg.Pool` parametrizado (sin ORMs como Prisma/Sequelize para máximo control y velocidad).
- **Esquema Relacional Unificado:** Implementado en `backend/db/init.sql` (36 tablas normalizadas en 3FN).
- **Semilla Integral:** `backend/db/semilla.js` con catálogos estáticos y datos de prueba.
- **Trazabilidad Git:**
  - `DB_Fase_0: Base de Datos DDL y Semilla con Catalogos` (commit `796cfef`)
  - `DB_Fase_1: Modulo 1 - Seguridad, Usuarios y Clientes` (commit `00bcd04`)
  - `DB_Fase_2: Modulo 3 - Almacen e Inventario` (commit `3efb98f`)
  - `DB_Fase_3: Modulo 2 - Pedidos, Medidas, Citas y Pagos` (commit `38efe66`)
  - `DB_Fase_4: Modulo 4 - Kardex y Notas de Venta` (commit `02d1db5`)

---

## 🧪 Pruebas Automatizadas y Validación
- **Suite de Pruebas Jest:** Ejecutable mediante `cmd /c "npm test"` en `backend/`.
  - 4 suites de prueba: `authController.test.js`, `UsuarioModel.test.js`, `PedidoModel.test.js`, `KardexModel.test.js`.
  - **14 tests de integración automatizados pasando al 100%**.
- **Dashboard de Pruebas Visual:** Accesible en `/admin/pruebas` (`AdminTestDashboard.jsx`) con ejecutor de Jest en vivo y probador interactivo de rutas API con presets rápidos.
- **Compilación de Producción:** Validada con `npx vite build` (156 módulos en ~400ms).

---

## 📄 Documentación Adicional para Proyecto de Grado
Para consultar las matrices de pruebas de **Caja Blanca**, **Caja Negra** (análisis de valores límite y clases de equivalencia), pruebas **UAT** y el mapa completo de endpoints, revisar el archivo:
👉 [INFORME_TECNICO_SISTEMA_Y_PRUEBAS.md](file:///c:/Users/samue/Documents/EMI/Proyecto%20de%20Grado/MARCO%20PRACTICO%20100%25/P_Simonetta_modas/INFORME_TECNICO_SISTEMA_Y_PRUEBAS.md)
