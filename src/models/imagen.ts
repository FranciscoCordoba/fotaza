import { eq } from "drizzle-orm";
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

    static async create(idPublicacion: number, url: string, textoMarcaDeAgua: string | null = null) {
        const nuevaImagen = await db.insert(imagenTable).values({
            idPublicacion,
            url,
            textoMarcaDeAgua
        }).returning()
        return nuevaImagen
    }

    static async getByPublicacionId(idPublicacion: number) {
        const imagenes = await db.select().from(imagenTable).where(eq(imagenTable.idPublicacion, idPublicacion))
        return imagenes
    }

    static async delete(id: number) {
        const imagenEliminada = await db.delete(imagenTable).where(eq(imagenTable.id, id)).returning()
        return imagenEliminada
    }

}