const path = require('path');
const db = require('../config/db');

async function migrateV3() {
    console.log('========================================================');
    console.log('  MIGRACIÓN V3: NORMALIZACIÓN Y CATÁLOGOS EN BD');
    console.log('========================================================\n');

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        console.log('1. Creando tablas para normalización de medidas convencionales...');
        
        // 1.1 Rangos de Edad
        await client.query(`
            CREATE TABLE IF NOT EXISTS rangos_edad (
                id_rango_edad serial PRIMARY KEY,
                nombre_rango varchar(50) UNIQUE NOT NULL,
                descripcion varchar(150)
            );
        `);

        // 1.2 Géneros
        await client.query(`
            CREATE TABLE IF NOT EXISTS generos (
                id_genero serial PRIMARY KEY,
                nombre_genero varchar(50) UNIQUE NOT NULL
            );
        `);

        // 1.3 Tallas Estándar
        await client.query(`
            CREATE TABLE IF NOT EXISTS tallas_estandar (
                id_talla_estandar serial PRIMARY KEY,
                nombre_talla varchar(10) UNIQUE NOT NULL,
                equivalencia_europea varchar(20),
                orden int
            );
        `);

        // 1.4 Matriz Maestra de Medidas Convencionales
        await client.query(`
            CREATE TABLE IF NOT EXISTS tabla_medidas_convencionales (
                id_tabla_medida serial PRIMARY KEY,
                id_rango_edad int REFERENCES rangos_edad(id_rango_edad) ON DELETE RESTRICT,
                id_genero int REFERENCES generos(id_genero) ON DELETE RESTRICT,
                id_talla_estandar int REFERENCES tallas_estandar(id_talla_estandar) ON DELETE RESTRICT,
                busto numeric(6,2),
                cintura numeric(6,2),
                cadera numeric(6,2),
                espalda numeric(6,2),
                hombro numeric(6,2),
                cortas numeric(6,2),
                frente numeric(6,2),
                alto_cadera numeric(6,2),
                entre_busto numeric(6,2),
                CONSTRAINT uk_tabla_medidas UNIQUE (id_rango_edad, id_genero, id_talla_estandar)
            );
        `);

        // 1.5 Adaptar tabla medidas_convencionales en detalle_pedido
        await client.query(`
            ALTER TABLE medidas_convencionales 
                ADD COLUMN IF NOT EXISTS id_rango_edad int REFERENCES rangos_edad(id_rango_edad),
                ADD COLUMN IF NOT EXISTS id_genero int REFERENCES generos(id_genero),
                ADD COLUMN IF NOT EXISTS id_talla_estandar int REFERENCES tallas_estandar(id_talla_estandar);
        `);

        console.log('   ✅ Tablas de medidas convencionales creadas/actualizadas.');

        console.log('2. Creando tabla para motivos_cita y actualizando citas...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS motivos_cita (
                id_motivo_cita serial PRIMARY KEY,
                nombre_motivo varchar(100) UNIQUE NOT NULL,
                descripcion text
            );

            ALTER TABLE citas
                ADD COLUMN IF NOT EXISTS id_motivo_cita int REFERENCES motivos_cita(id_motivo_cita),
                ADD COLUMN IF NOT EXISTS observaciones text;
        `);
        console.log('   ✅ Tabla motivos_cita creada y citas actualizada.');

        console.log('3. Creando tabla descripciones_detalladas_prenda y actualizando descripciones_prenda...');
        await client.query(`
            ALTER TABLE descripciones_prenda 
                ADD COLUMN IF NOT EXISTS descripcion_general varchar(255);

            CREATE TABLE IF NOT EXISTS descripciones_detalladas_prenda (
                id_descripcion_detallada serial PRIMARY KEY,
                id_descripcion_prenda int UNIQUE REFERENCES descripciones_prenda(id_descripcion_prenda) ON DELETE CASCADE,
                descripcion_detallada text,
                especificaciones_patronaje text,
                cuidados_recomendados text
            );
        `);
        console.log('   ✅ Tabla descripciones_detalladas_prenda creada.');

        console.log('4. Poblando catálogos base...');

        // 4.1 Poblar rangos_edad
        await client.query(`
            INSERT INTO rangos_edad (nombre_rango, descripcion) VALUES
            ('Adulto', 'Rango de personas adultas (18 años en adelante)'),
            ('Adolescente', 'Rango de jóvenes y adolescentes (12 a 17 años)'),
            ('Niño', 'Rango infantil (4 a 11 años)')
            ON CONFLICT (nombre_rango) DO NOTHING;
        `);

        // 4.2 Poblar generos
        await client.query(`
            INSERT INTO generos (nombre_genero) VALUES
            ('Mujer'),
            ('Varón'),
            ('Unisex')
            ON CONFLICT (nombre_genero) DO NOTHING;
        `);

        // 4.3 Poblar tallas_estandar
        await client.query(`
            INSERT INTO tallas_estandar (nombre_talla, equivalencia_europea, orden) VALUES
            ('XS', '34-36', 1),
            ('S', '36-38', 2),
            ('M', '38-40', 3),
            ('L', '42-44', 4),
            ('XL', '46-48', 5),
            ('XXL', '50-52', 6)
            ON CONFLICT (nombre_talla) DO UPDATE SET 
                equivalencia_europea = EXCLUDED.equivalencia_europea,
                orden = EXCLUDED.orden;
        `);

        // 4.4 Poblar motivos_cita
        await client.query(`
            INSERT INTO motivos_cita (nombre_motivo, descripcion) VALUES
            ('Cotización y Diseño', 'Asesoría inicial de diseño, elección de modelo y presupuesto'),
            ('Toma de Medidas', 'Registro presencial de medidas corporales y patronaje'),
            ('Primera Prueba de Vestuario', 'Prueba preliminar del ensamble y caída de la prenda'),
            ('Ajuste de Prenda', 'Segunda prueba de precisión y ajustes finos'),
            ('Entrega y Retiro', 'Recepción final de la prenda terminada y liquidación de saldo'),
            ('Consulta General', 'Atención para consultas generales y requerimientos especiales')
            ON CONFLICT (nombre_motivo) DO NOTHING;
        `);

        // 4.5 Poblar matriz de medidas convencionales
        const matriz = [
            // Adulto - Mujer
            ['Adulto', 'Mujer', 'XS', 82, 62, 88, 35, 11, 38, 41, 18, 16],
            ['Adulto', 'Mujer', 'S', 86, 66, 92, 36, 11.5, 40, 42, 19, 17],
            ['Adulto', 'Mujer', 'M', 92, 72, 98, 37, 12, 42, 44, 20, 18],
            ['Adulto', 'Mujer', 'L', 100, 80, 106, 38.5, 12.5, 43.5, 46, 21, 19],
            ['Adulto', 'Mujer', 'XL', 108, 88, 114, 40, 13, 45, 48, 22, 20],
            ['Adulto', 'Mujer', 'XXL', 116, 96, 122, 42, 13.5, 46, 50, 23, 21],
            
            // Adulto - Varón
            ['Adulto', 'Varón', 'XS', 88, 74, 90, 41, 13, 43, 43, 20, 19],
            ['Adulto', 'Varón', 'S', 94, 80, 96, 43, 13.5, 44.5, 45, 20.5, 20],
            ['Adulto', 'Varón', 'M', 100, 86, 102, 45, 14, 46, 47, 21, 21],
            ['Adulto', 'Varón', 'L', 108, 94, 110, 47, 14.5, 48, 49, 22, 22],
            ['Adulto', 'Varón', 'XL', 116, 102, 118, 49, 15, 49.5, 51, 23, 23],
            ['Adulto', 'Varón', 'XXL', 124, 110, 126, 51, 15.5, 51, 53, 24, 24],

            // Adolescente - Mujer
            ['Adolescente', 'Mujer', 'XS', 74, 56, 80, 32, 9.5, 34, 36, 16, 14],
            ['Adolescente', 'Mujer', 'S', 78, 60, 84, 33, 10, 36, 38, 17, 15],
            ['Adolescente', 'Mujer', 'M', 82, 64, 88, 34.5, 10.5, 38, 40, 18, 16],
            ['Adolescente', 'Mujer', 'L', 86, 68, 92, 36, 11, 40, 42, 19, 17],
            ['Adolescente', 'Mujer', 'XL', 92, 74, 98, 37, 11.5, 41, 43, 19.5, 18],
            ['Adolescente', 'Mujer', 'XXL', 98, 80, 104, 38, 12, 42, 44, 20, 19],

            // Adolescente - Varón
            ['Adolescente', 'Varón', 'XS', 76, 64, 80, 36, 11, 38, 38, 17, 16],
            ['Adolescente', 'Varón', 'S', 82, 68, 84, 38, 11.5, 40, 40, 18, 17],
            ['Adolescente', 'Varón', 'M', 88, 74, 90, 40, 12, 42, 42, 19, 18],
            ['Adolescente', 'Varón', 'L', 94, 80, 96, 42, 12.5, 44, 44, 20, 19],
            ['Adolescente', 'Varón', 'XL', 100, 86, 102, 44, 13, 45.5, 46, 21, 20],
            ['Adolescente', 'Varón', 'XXL', 106, 92, 108, 46, 13.5, 47, 48, 21.5, 21],

            // Niño - Mujer
            ['Niño', 'Mujer', 'XS', 54, 50, 56, 24, 7, 24, 25, 12, 11],
            ['Niño', 'Mujer', 'S', 58, 53, 60, 25.5, 7.5, 26, 27, 13, 12],
            ['Niño', 'Mujer', 'M', 62, 56, 64, 27, 8, 28, 29, 14, 13],
            ['Niño', 'Mujer', 'L', 66, 59, 68, 28.5, 8.5, 30, 31, 14.5, 13.5],
            ['Niño', 'Mujer', 'XL', 70, 62, 72, 30, 9, 32, 33, 15, 14],
            ['Niño', 'Mujer', 'XXL', 74, 65, 76, 31, 9.5, 34, 35, 15.5, 14.5],

            // Niño - Varón
            ['Niño', 'Varón', 'XS', 56, 52, 58, 25, 7.5, 25, 26, 12.5, 12],
            ['Niño', 'Varón', 'S', 60, 55, 62, 26.5, 8, 27, 28, 13.5, 12.5],
            ['Niño', 'Varón', 'M', 64, 58, 66, 28, 8.5, 29, 30, 14, 13],
            ['Niño', 'Varón', 'L', 68, 61, 70, 29.5, 9, 31, 32, 15, 14],
            ['Niño', 'Varón', 'XL', 72, 64, 74, 31, 9.5, 33, 34, 15.5, 14.5],
            ['Niño', 'Varón', 'XXL', 76, 67, 78, 32.5, 10, 35, 36, 16, 15]
        ];

        for (const row of matriz) {
            const [rango, genero, talla, busto, cintura, cadera, espalda, hombro, cortas, frente, alto_cadera, entre_busto] = row;
            await client.query(`
                INSERT INTO tabla_medidas_convencionales (
                    id_rango_edad, id_genero, id_talla_estandar,
                    busto, cintura, cadera, espalda, hombro, cortas, frente, alto_cadera, entre_busto
                ) VALUES (
                    (SELECT id_rango_edad FROM rangos_edad WHERE nombre_rango = $1),
                    (SELECT id_genero FROM generos WHERE nombre_genero = $2),
                    (SELECT id_talla_estandar FROM tallas_estandar WHERE nombre_talla = $3),
                    $4, $5, $6, $7, $8, $9, $10, $11, $12
                )
                ON CONFLICT (id_rango_edad, id_genero, id_talla_estandar) DO UPDATE SET
                    busto = EXCLUDED.busto,
                    cintura = EXCLUDED.cintura,
                    cadera = EXCLUDED.cadera,
                    espalda = EXCLUDED.espalda,
                    hombro = EXCLUDED.hombro,
                    cortas = EXCLUDED.cortas,
                    frente = EXCLUDED.frente,
                    alto_cadera = EXCLUDED.alto_cadera,
                    entre_busto = EXCLUDED.entre_busto;
            `, [rango, genero, talla, busto, cintura, cadera, espalda, hombro, cortas, frente, alto_cadera, entre_busto]);
        }
        console.log(`   ✅ Matriz de ${matriz.length} combinaciones de medidas insertada.`);

        // 5. Migrar citas existentes con id_motivo_cita
        console.log('5. Actualizando citas existentes con sus claves foráneas a motivos_cita...');
        await client.query(`
            UPDATE citas c
            SET id_motivo_cita = (
                CASE 
                    WHEN LOWER(c.motivo_cita) LIKE '%prueba%' THEN (SELECT id_motivo_cita FROM motivos_cita WHERE nombre_motivo = 'Primera Prueba de Vestuario')
                    WHEN LOWER(c.motivo_cita) LIKE '%medida%' THEN (SELECT id_motivo_cita FROM motivos_cita WHERE nombre_motivo = 'Toma de Medidas')
                    WHEN LOWER(c.motivo_cita) LIKE '%entrega%' OR LOWER(c.motivo_cita) LIKE '%retiro%' THEN (SELECT id_motivo_cita FROM motivos_cita WHERE nombre_motivo = 'Entrega y Retiro')
                    WHEN LOWER(c.motivo_cita) LIKE '%ajuste%' THEN (SELECT id_motivo_cita FROM motivos_cita WHERE nombre_motivo = 'Ajuste de Prenda')
                    WHEN LOWER(c.motivo_cita) LIKE '%cotiz%' OR LOWER(c.motivo_cita) LIKE '%diseño%' OR LOWER(c.motivo_cita) LIKE '%diseno%' THEN (SELECT id_motivo_cita FROM motivos_cita WHERE nombre_motivo = 'Cotización y Diseño')
                    ELSE (SELECT id_motivo_cita FROM motivos_cita WHERE nombre_motivo = 'Consulta General')
                END
            )
            WHERE c.id_motivo_cita IS NULL;
        `);

        // 6. Migrar descripciones_prenda a descripciones_detalladas_prenda
        console.log('6. Migrando descripciones_prenda a tabla normalizada descripciones_detalladas_prenda...');
        await client.query(`
            UPDATE descripciones_prenda 
            SET descripcion_general = COALESCE(NULLIF(SUBSTRING(descripcion_detallada FROM 1 FOR 100), ''), 'Prenda de Alta Costura')
            WHERE descripcion_general IS NULL;

            INSERT INTO descripciones_detalladas_prenda (id_descripcion_prenda, descripcion_detallada, especificaciones_patronaje, cuidados_recomendados)
            SELECT 
                dp.id_descripcion_prenda,
                COALESCE(dp.descripcion_detallada, 'Diseño exclusivo de alta costura a medida.'),
                'Patronaje de precisión según silueta antropométrica.',
                'Lavado en seco profesional, no usar blanqueadores, planchar con paño protector.'
            FROM descripciones_prenda dp
            ON CONFLICT (id_descripcion_prenda) DO NOTHING;
        `);

        // 7. Migrar medidas_convencionales existentes
        console.log('7. Actualizando medidas_convencionales con id_rango_edad, id_genero, id_talla_estandar...');
        await client.query(`
            UPDATE medidas_convencionales mc
            SET 
                id_rango_edad = COALESCE(mc.id_rango_edad, (SELECT id_rango_edad FROM rangos_edad WHERE nombre_rango = 'Adulto')),
                id_genero = COALESCE(mc.id_genero, (SELECT id_genero FROM generos WHERE nombre_genero = 'Mujer')),
                id_talla_estandar = COALESCE(mc.id_talla_estandar, (SELECT id_talla_estandar FROM tallas_estandar WHERE nombre_talla = mc.talla))
            WHERE mc.id_talla_estandar IS NULL;
        `);

        await client.query('COMMIT');
        console.log('\n========================================================');
        console.log('  ¡MIGRACIÓN V3 COMPLETADA EXITOSAMENTE!');
        console.log('========================================================\n');
        process.exit(0);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error en migración V3:', err);
        process.exit(1);
    } finally {
        client.release();
    }
}

migrateV3();
