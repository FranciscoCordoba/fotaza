import { eq } from "drizzle-orm";
import { publicacionTable } from "../db/schemas/publicacion.js";
import { db } from "../index.js";

export class publicacionModel {

    static async getAll() {
        const publicaciones = await db.select().from(publicacionTable)
        return publicaciones
    }

    static async getById(id: number) {
        const publicacion = await db.select().from(publicacionTable).where(eq(publicacionTable.id, id))
        return publicacion
    }

    static async create(nickUsuario: string, titulo: string, descripcion: string, editable: boolean) {
        const nuevaPublicacion = await db.insert(publicacionTable).values({
            nickUsuario,
            titulo,
            descripcion,
            editable
        }).returning()
        return nuevaPublicacion
    }

    static async delete(id: number) {
        const publicacionEliminada = await db.delete(publicacionTable).where(eq(publicacionTable.id, id)).returning()
        return publicacionEliminada
    }

}