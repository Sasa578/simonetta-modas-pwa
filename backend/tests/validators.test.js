const {
    validarTelefono,
    validarTextoAlfabetico,
    validarCI,
    validarEmail,
    validarMonto
} = require('../middlewares/dataValidator');

describe('DataValidator Middleware & Helper Tests', () => {

    describe('validarTelefono', () => {
        test('debe aceptar números válidos con o sin prefijo +', () => {
            expect(validarTelefono('+591 70011223', 'teléfono', true).valido).toBe(true);
            expect(validarTelefono('77712345', 'teléfono', true).valido).toBe(true);
            expect(validarTelefono('2 2789000', 'teléfono', true).valido).toBe(true);
        });

        test('debe rechazar teléfonos que contengan letras', () => {
            const res = validarTelefono('777abc12', 'teléfono', true);
            expect(res.valido).toBe(false);
            expect(res.error).toMatch(/no puede contener letras/i);
        });

        test('debe rechazar caracteres de inyección o símbolos extraños', () => {
            const res = validarTelefono("7771234; DROP", 'teléfono', true);
            expect(res.valido).toBe(false);
        });

        test('debe rechazar números con menos de 7 dígitos', () => {
            const res = validarTelefono('12345', 'teléfono', true);
            expect(res.valido).toBe(false);
            expect(res.error).toMatch(/entre 7 y 15 dígitos/i);
        });
    });

    describe('validarTextoAlfabetico (Nombres y Apellidos)', () => {
        test('debe aceptar nombres reales con espacios y tildes', () => {
            expect(validarTextoAlfabetico('María René', 'nombre', true).valido).toBe(true);
            expect(validarTextoAlfabetico('Gómez Pérez', 'apellido', true).valido).toBe(true);
            expect(validarTextoAlfabetico('Ñuflo de Chávez', 'nombre', true).valido).toBe(true);
        });

        test('debe rechazar nombres que contengan números', () => {
            const res = validarTextoAlfabetico('Carlos123', 'nombre', true);
            expect(res.valido).toBe(false);
            expect(res.error).toMatch(/no puede contener números/i);
        });

        test('debe rechazar nombres con símbolos especiales o etiquetas HTML', () => {
            const res = validarTextoAlfabetico('<script>alert()</script>', 'nombre', true);
            expect(res.valido).toBe(false);
            expect(res.error).toMatch(/solo debe contener letras/i);
        });

        test('debe rechazar nombres con menos de 2 caracteres', () => {
            const res = validarTextoAlfabetico('A', 'nombre', true);
            expect(res.valido).toBe(false);
        });
    });

    describe('validarCI y NIT', () => {
        test('debe aceptar formatos válidos de carnet y NIT', () => {
            expect(validarCI('1234567 LP', 'carnet', true).valido).toBe(true);
            expect(validarCI('8765432-1A', 'carnet', true).valido).toBe(true);
            expect(validarCI('1029384756', 'NIT', true).valido).toBe(true);
        });

        test('debe rechazar símbolos sospechosos en el carnet', () => {
            const res = validarCI("12345';--", 'carnet', true);
            expect(res.valido).toBe(false);
        });
    });

    describe('validarMonto', () => {
        test('debe aceptar valores positivos numéricos', () => {
            expect(validarMonto(150.50, 'costo', true).valido).toBe(true);
            expect(validarMonto('2500', 'costo', true).valido).toBe(true);
        });

        test('debe rechazar valores negativos o no numéricos', () => {
            expect(validarMonto(-50, 'costo', true).valido).toBe(false);
            expect(validarMonto('quinientos', 'costo', true).valido).toBe(false);
        });
    });

    describe('validarEmail', () => {
        test('debe aceptar correos con estructura válida', () => {
            expect(validarEmail('cliente@correo.com', 'correo', true).valido).toBe(true);
            expect(validarEmail('admin.modas@simonetta.bo', 'correo', true).valido).toBe(true);
        });

        test('debe rechazar correos sin arroba o sin dominio', () => {
            expect(validarEmail('correo-invalido', 'correo', true).valido).toBe(false);
            expect(validarEmail('usuario@', 'correo', true).valido).toBe(false);
        });
    });
});
