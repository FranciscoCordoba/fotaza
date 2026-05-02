import { eq } from "drizzle-orm";
import { comunidadTable } from "../db/schemas/comunidad.js";
import { db } from "../index.js";

export class comunidadModel {

    static async getAll() {
        const comunidades = await db.select().from(comunidadTable)
        return comunidades
    }

    static async getByNickname(nickComunidad: string) {
        const comunidades = await db.select().from(comunidadTable).where(eq(comunidadTable.nickComunidad, nickComunidad))
        return comunidades
    }

    static async create(nickComunidad: string, nombre: string, descripcion: string, imagen: string, normas: string) {
        const nuevaComunidad = await db.insert(comunidadTable).values({
            nickComunidad,
            nombre,
            descripcion,
            imagen,
            normas
        }).returning()
        return nuevaComunidad
    }

    static async delete(nickComunidad: string) {
        const comunidadEliminada = await db.delete(comunidadTable).where(eq(comunidadTable.nickComunidad, nickComunidad)).returning()
        return comunidadEliminada
    }

}