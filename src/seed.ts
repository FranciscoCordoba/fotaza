import { db } from "./index.js";
import { rolTable } from "./db/schemas/usuario.js";
import { evaluacionTable } from "./db/schemas/denunciaImagen.js";

try {
    db.insert(rolTable).values([
        { nombre: 'usuario' },
        { nombre: 'moderador' }
    ]).onConflictDoNothing()

    db.insert(evaluacionTable).values([
        { estado: 'pendiente' },
        { estado: 'aceptada' },
        { estado: 'rechazada' }
    ]).onConflictDoNothing()

    console.log('Seed realizado exitosamente')
} catch (e) {
    console.log(e)
}