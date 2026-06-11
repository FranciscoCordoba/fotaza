import { eq, and } from "drizzle-orm";
import { imagenTable } from "../db/schemas/imagen.js";
import { db } from "../index.js";

export class imagenModel {

    static async getAll() {
        const imagenes = await db.select().from(imagenTable)
        return imagenes
    }

    static async getById(id: number) {
        const imagen = await db.select().from(imagenTable).where(eq(imagenTable.id, id))
        return imagen[0]
    }

    static async create(idPublicacion: number, url: string, orden: number, textoMarcaDeAgua: string | null = null) {
        const nuevaImagen = await db.insert(imagenTable).values({
            idPublicacion,
            url,
            orden,
            textoMarcaDeAgua
        }).returning()
        return nuevaImagen
    }

    static async getByPublicacionId(idPublicacion: number) {
        const imagenes = await db.select().from(imagenTable).where(eq(imagenTable.idPublicacion, idPublicacion))
        return imagenes
    }

    static async getByPublicacionIdAndOrden(idPublicacion: number, orden: number) {
        const imagen = await db.select().from(imagenTable).where(and(eq(imagenTable.idPublicacion, idPublicacion), eq(imagenTable.orden, orden)))
        return imagen[0]
    }

    static async getPrevYPost(idPublicacion: number, orden: number) {
        const prev = await db.select({ orden: imagenTable.orden }).from(imagenTable).where(and(eq(imagenTable.idPublicacion, idPublicacion), eq(imagenTable.orden, orden - 1)))
        const post = await db.select({ orden: imagenTable.orden }).from(imagenTable).where(and(eq(imagenTable.idPublicacion, idPublicacion), eq(imagenTable.orden, orden + 1)))
        return { prev: prev[0], post: post[0] }
    }

    static async delete(id: number) {
        const imagenEliminada = await db.delete(imagenTable).where(eq(imagenTable.id, id)).returning()
        return imagenEliminada
    }

}