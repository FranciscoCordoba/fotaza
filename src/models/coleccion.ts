import { db } from "../index.js"
import { coleccionTable } from "../db/schemas/coleccion.js"
import { and, eq } from "drizzle-orm"
import type { coleccionInsert, coleccion } from "../utils/types.js"

export class coleccionModel {
    static async getAll() {
        const colecciones = await db.select().from(coleccionTable)
        return colecciones
    }

    static async getByNickUsuario(nick: string) {
        const colecciones = await db.select().from(coleccionTable).where(eq(coleccionTable.nickUsuario, nick))
        return colecciones
    }

    static async create(nickUsuario: string, nickColeccion: string, idPublicacion: number) {
        const nuevaColeccion = await db.insert(coleccionTable).values({
            nickUsuario,
            nickColeccion,
            idPublicacion
        }).returning()
        return nuevaColeccion
    }

    static async delete(nickUsuario: string, nickColeccion: string, idPublicacion: number) {
        const coleccionEliminada = await db.delete(coleccionTable).where(
            and(
                eq(coleccionTable.nickUsuario, nickUsuario),
                eq(coleccionTable.nickColeccion, nickColeccion),
                eq(coleccionTable.idPublicacion, idPublicacion)
            )
        ).returning()
        return coleccionEliminada
    }

    static async getByUsuarioAndPublicacion(nickUsuario: string, idPublicacion: number) {
        return await db.select().from(coleccionTable).where(
            and(
                eq(coleccionTable.nickUsuario, nickUsuario),
                eq(coleccionTable.idPublicacion, idPublicacion)
            )
        )
    }

    static async deleteAllFromUsuarioAndPublicacion(nickUsuario: string, idPublicacion: number) {
        return await db.delete(coleccionTable).where(
            and(
                eq(coleccionTable.nickUsuario, nickUsuario),
                eq(coleccionTable.idPublicacion, idPublicacion)
            )
        ).returning()
    }

    static async getColeccionesConUltimaPublicacion(nickUsuario: string) {
        const colecciones = await db.select().from(coleccionTable).where(eq(coleccionTable.nickUsuario, nickUsuario));
        
        const map = new Map<string, number>();
        colecciones.forEach(c => {
            const current = map.get(c.nickColeccion);
            if (!current || c.idPublicacion > current) {
                map.set(c.nickColeccion, c.idPublicacion);
            }
        });
        
        return Array.from(map.entries()).map(([nickColeccion, idPublicacion]) => ({ nickColeccion, idPublicacion }));
    }

    static async getPublicacionesEnColeccion(nickUsuario: string, nickColeccion: string) {
        return await db.select().from(coleccionTable).where(
            and(
                eq(coleccionTable.nickUsuario, nickUsuario),
                eq(coleccionTable.nickColeccion, nickColeccion)
            )
        )
    }
}