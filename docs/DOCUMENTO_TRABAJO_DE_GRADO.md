# ESCUELA MILITAR DE INGENIERÍA
## MCAL. ANTONIO JOSÉ DE SUCRE
### CARRERA DE INGENIERÍA DE SISTEMAS

---

# TRABAJO DE GRADO: SISTEMA DE GESTIÓN INTEGRAL Y PWA PARA TALLER DE ALTA COSTURA "SIMONETTA MODAS"

**Asignatura:** Seminario de Software  
**Docente:** Ing. Jaime Gabriel Soto Gonzales  
**Estudiante:** Proyecto de Trabajo de Grado  
**Fecha:** Agosto 2026  

---

## 1. GENERALIDADES
El presente trabajo de grado abarca el diseño, desarrollo e implementación de un sistema de gestión integral tipo Progressive Web App (PWA) para el taller de alta costura "Simonetta Modas". El sistema abarca el control de producción, inventario de almacén, registro de medidas anatómicas por cliente, agenda de citas y notificaciones push en tiempo real.

---

## 2. PLANTEAMIENTO DEL PROBLEMA
En los talleres de confección a medida tradicionales, la gestión de pedidos, la toma de medidas y el seguimiento de inventarios se realizan de manera manual en bitácoras físicas o mediante mensajería informal. Esto ocasiona desorganización en las entregas, pérdida de historial de medidas anatómicas y falta de visibilidad en el estado de confección de las prendas por parte de las clientes y costureras.

### Formulación del Problema
¿De qué manera un sistema web progresivo (PWA) permite optimizar el control de pedidos, seguimiento de producción y gestión de medidas anatómicas en el taller de alta costura Simonetta Modas?

---

## 3. OBJETIVOS

### 3.1 Objetivo General
Desarrollar e implementar una plataforma web progresiva (PWA) basada en arquitectura Node.js, Express, React y PostgreSQL que permita optimizar la gestión operativa, control de inventario, agenda de citas y seguimiento de pedidos en el taller Simonetta Modas.

### 3.2 Objetivos Específicos
1. Diseñar el modelo de datos relacional en tercera forma normal (3FN) en PostgreSQL para garantizar la integridad del catálogo de clientes, pedidos, insumos y medidas.
2. Desarrollar una API REST robusta en Node.js/Express con autenticación JWT y encriptación bcrypt para la gestión segura de roles (Admin, Secretaría, Costurera, Cliente).
3. Construir la interfaz PWA responsiva en React.js orientada a la experiencia táctil móvil y de escritorio.
4. Implementar notificaciones push y alertas de caducidad de medidas anatómicas mayores a 6 meses.
5. Desplegar y validar la plataforma en red local (LAN) para la interacción directa desde dispositivos móviles.

---

## 4. JUSTIFICACIÓN
- **Técnica:** Utilización de tecnologías modernas (React, Vite, Node.js, PostgreSQL) bajo arquitectura desacoplada API REST.
- **Económica / Operativa:** Reducción de tiempos muertos en taller y optimización en la compra de materiales de almacén.
- **Social / Usuario:** Brinda a las clientas transparencia en el avance de sus prendas desde sus dispositivos móviles.

---

## 5. MARCO TEÓRICO
- **Progressive Web Applications (PWA):** Aplicaciones web con capacidades de instalación nativa y funcionamiento fuera de línea mediante Service Workers.
- **Arquitectura Cliente-Servidor (REST):** Desacoplamiento entre la lógica de negocio (Backend) y la presentación (Frontend).
- **PostgreSQL y Transacciones Atómicas (ACID):** Manejo seguro de datos de inventario y pedidos mediante bloques BEGIN / COMMIT / ROLLBACK.

---

## 6. METODOLOGÍA
Se empleó la metodología ágil **SCRUM**, organizada en iteraciones semanales (Sprints), permitiendo la entrega incremental de módulos (Autenticación, Clientes, Medidas, Almacén, Pedidos y Citas).

---

## 7. ARQUITECTURA Y DISEÑO DEL SISTEMA
- **Backend:** Node.js v18+, Express.js, pg Pool PostgreSQL.
- **Frontend:** React 18, Vite, Axios, PWA Workbox.
- **Seguridad:** Tokens JWT en cabeceras HTTP, Hashes crypt de 10 rondas.

---

## 8. RESULTADOS Y CONCLUSIONES
Se logró implementar y desplegar el sistema con éxito en entorno de pruebas y red local. Las pruebas de carga y rendimiento en dispositivos móviles demostraron una respuesta fluida, permitiendo a las costureras actualizar estados de prendas en tiempo real y a la secretaría gestionar la agenda sin conflictos.
