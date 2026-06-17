import { eq, ilike, inArray } from "drizzle-orm";
import { publicacionTable } from "../db/schemas/publicacion.js";
import { db } from "../index.js";

export class publicacionModel {

    static async getAll() {
        const publicaciones = await db.select().from(publicacionTable)
        return publicaciones
    }

    static async getById(id: number) {
        const publicacion = await db.select().from(publicacionTable).where(eq(publicacionTable.id, id))
        return publicacion[0]
    }

    static async getByIds(ids: number[]) {
        const publicaciones = await db.select().from(publicacionTable).where(inArray(publicacionTable.id, ids))
        return publicaciones
    }


    static async getByTitulo(titulo: string) {
        const publicaciones = await db.select().from(publicacionTable).where(ilike(publicacionTable.titulo, `%${titulo}%`)).limit(10)
        return publicaciones
    }

    static async getByNickUsuario(nickUsuario: string) {
        const publicaciones = await db.select().from(publicacionTable).where(eq(publicacionTable.nickUsuario, nickUsuario))
        return publicaciones
    }

    static async create(nickUsuario: string, titulo: string, descripcion: string) {
        const nuevaPublicacion = await db.insert(publicacionTable).values({
            nickUsuario,
            titulo,
            descripcion
        }).returning()
        return nuevaPublicacion
    }

    static async delete(id: number) {
        const publicacionEliminada = await db.delete(publicacionTable).where(eq(publicacionTable.id, id)).returning()
        return publicacionEliminada
    }

}