import { db } from "../index.js"
import { coleccionTable } from "../db/schemas/coleccion.js"
import { and, eq } from "drizzle-orm"
import type { coleccionInsert, coleccion } from "../utils/types.js"

export class coleccionModel {
    static async getAll(): Promise<coleccion[]> {
        const colecciones = await db.select().from(coleccionTable)
        return colecciones
    }

    static async getByNickUsuario(nick: string): Promise<coleccion[]> {
        const colecciones = await db.select().from(coleccionTable).where(eq(coleccionTable.nickUsuario, nick))
        return colecciones
    }

    static async create(nickUsuario: string, nickColeccion: string, idPublicacion: number): Promise<coleccion[]> {
        const nuevaColeccion = await db.insert(coleccionTable).values({
            nickUsuario,
            nickColeccion,
            idPublicacion
        }).returning()
        return nuevaColeccion
    }

    static async delete(nickUsuario: string, nickColeccion: string, idPublicacion: number): Promise<coleccion[]> {
        const coleccionEliminada = await db.delete(coleccionTable).where(
            and(
                eq(coleccionTable.nickUsuario, nickUsuario),
                eq(coleccionTable.nickColeccion, nickColeccion),
                eq(coleccionTable.idPublicacion, idPublicacion)
            )
        ).returning()
        return coleccionEliminada
    }
}