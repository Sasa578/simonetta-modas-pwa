# 📜 Bitácora de Avances y Cambios (CHANGELOG)
## Trabajo de Grado - Simonetta Modas PWA
### Escuela Militar de Ingeniería (EMI) — Asignatura: Seminario de Software
**Docente:** Ing. Jaime Gabriel Soto Gonzales

Registro de la evolución del documento de trabajo de grado, arquitectura del sistema y código fuente.

---

| Fecha | Versión | Cambio Realizado | Observaciones / Hito |
| :--- | :--- | :--- | :--- |
| 10/08/2026 | **v0.1** | Creación del repositorio inicial y estructuración de carpetas backend/frontend. | **Hito:** Aprobación de propuesta inicial y perfil del trabajo de grado. |
| 12/08/2026 | **v0.2** | Formulación del problema, definición de objetivos y diseño del esquema relacional PostgreSQL (3FN). | **Hito:** Validación de estructura de base de datos e inicialización de scripts `init.sql`. |
| 14/08/2026 | **v0.3** | Implementación de API REST en Express.js (JWT, roles) y vistas responsivas PWA en React.js. | **Hito:** Desarrollo de componentes del sistema (Autenticación, Almacén, Pedidos y Citas). |
| 16/08/2026 | **v0.4** | Configuración de servidor en red local (LAN) para pruebas interactivas en dispositivos celulares. | **Hito:** Corrección de flujo atómico entre cuentas de Usuario y perfiles de Cliente. |
| 17/08/2026 | **v1.0** | Finalización del documento del trabajo de grado, consolidación de bitácora y etiquetas de releases. | **Hito:** Entrega final de evidencias y control de versiones académico. |
| 18/08/2026 | **v1.1-security** | Implementación de verificación CAPTCHA dinámica visual en inicio de sesión y desinfección contra SQLi. | **Hito de Subsanación (Tribunal):** Seguridad reforzada en pantalla de Login. |
| 18/08/2026 | **v1.2-validation** | Aplicación de máscaras estrictas para números de teléfono/WhatsApp y validación de campos. | **Hito de Subsanación (Tribunal):** Resguardo de integridad de datos en formularios. |
| 18/08/2026 | **v1.3-password-flow**| Asignación de contraseña genérica `12345678` a operarias y modal de cambio obligatorio en primer inicio. | **Hito de Subsanación (Tribunal):** Flujo de seguridad para contraseñas de personal. |
| 28/08/2026 | **v1.4-jest-testing** | Configuración de marco de pruebas automatizadas Jest/Supertest y controlador de reporte de estado de API. | **Hito:** Pruebas automatizadas del sistema con 100% de tasa de éxito. |
| 28/08/2026 | **v1.5-mini-postman** | Nuevo menú `🧪 Pruebas` en Admin, Dashboard de resultados Jest y cliente interactivo Mini Postman. | **Hito:** Herramienta interactiva de pruebas de usabilidad y cliente HTTP en panel Admin. |

---

### 🏷️ Historial de Etiquetas (Tags & Releases)
- **`v0.1`**: Propuesta inicial y perfil de proyecto.
- **`v0.2`**: Planteamiento del problema y objetivos.
- **`v0.3`**: Marco teórico y diseño de arquitectura.
- **`v0.4`**: Metodología y desarrollo del sistema PWA.
- **`v1.0`**: Versión final del documento y sistema completo.
- **`v1.1-security`**: CAPTCHA dinámico y sanitización contra inyecciones SQL en Login.
- **`v1.2-validation`**: Validación estricta de campos telefónicos y numéricos.
- **`v1.3-password-flow`**: Clave genérica `12345678` y cambio obligatorio en primer ingreso de operarias.
- **`v1.4-jest-testing`**: Suite de pruebas Jest/Supertest backend y ejecutor de reportes API.
- **`v1.5-mini-postman`**: Dashboard de pruebas de usabilidad Jest y cliente interactivo Mini Postman en panel Admin.
