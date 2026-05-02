import { and, eq } from "drizzle-orm";
import { etiquetaTable } from "../db/schemas/etiqueta.js";
import { db } from "../index.js";

export class etiquetaModel {

    static async getAll() {
        const etiquetas = await db.select().from(etiquetaTable)
        return etiquetas
    }

    static async getByEtiqueta(etiqueta: string) {
        const etiquetas = await db.select().from(etiquetaTable).where(eq(etiquetaTable.etiqueta, etiqueta))
        return etiquetas
    }

    static async getByIdPublicacion(idPublicacion: number) {
        const etiquetas = await db.select().from(etiquetaTable).where(eq(etiquetaTable.idPublicacion, idPublicacion))
        return etiquetas
    }

    static async create(idPublicacion: number, etiqueta: string) {
        const nuevaEtiqueta = await db.insert(etiquetaTable).values({
            idPublicacion,
            etiqueta
        }).returning()
        return nuevaEtiqueta
    }

    static async delete(idPublicacion: number, etiqueta: string) {
        const etiquetaEliminada = await db.delete(etiquetaTable).where(
            and(
                eq(etiquetaTable.idPublicacion, idPublicacion),
                eq(etiquetaTable.etiqueta, etiqueta)
            )
        ).returning()
        return etiquetaEliminada
    }


}