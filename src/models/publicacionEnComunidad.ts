import { and, eq } from "drizzle-orm";
import { publicacionEnComunidadTable } from "../db/schemas/publicacionEnComunidad.js";
import { db } from "../index.js";

export class publicacionEnComunidadModel {

    static async getAll() {
        const publicaciones = await db.select().from(publicacionEnComunidadTable)
        return publicaciones
    }

    static async getByComunidad(nickComunidad: string) {
        const publicaciones = await db.select().from(publicacionEnComunidadTable).where(eq(publicacionEnComunidadTable.nickComunidad, nickComunidad))
        return publicaciones
    }

    static async getByPublicacion(idPublicacion: number) {
        const publicaciones = await db.select().from(publicacionEnComunidadTable).where(eq(publicacionEnComunidadTable.idPublicacion, idPublicacion))
        return publicaciones
    }

    static async create(nickComunidad: string, idPublicacion: number) {
        const nuevaPublicacion = await db.insert(publicacionEnComunidadTable).values({
            nickComunidad,
            idPublicacion
        }).returning()
        return nuevaPublicacion
    }

    static async delete(nickComunidad: string, idPublicacion: number) {
        const publicacionEliminada = await db.delete(publicacionEnComunidadTable).where(
            and(
                eq(publicacionEnComunidadTable.nickComunidad, nickComunidad),
                eq(publicacionEnComunidadTable.idPublicacion, idPublicacion)
            )
        ).returning()
        return publicacionEliminada
    }

}