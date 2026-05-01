import { db } from "../index.js";
import { comentarioTable } from "../db/schemas/comentario.js";
import { and, eq } from "drizzle-orm";

export class comentarioModel {
    static async getAll() {
        const comentarios = await db.select().from(comentarioTable)
        return comentarios
    }

    static async getAllByImage(idImagen: number) {
        const comentarios = await db.select().from(comentarioTable).where(eq(comentarioTable.idImagen, idImagen))
        return comentarios
    }

    static async create(nickUsuario: string, idImagen: number, texto: string) {
        const newComentario = await db.insert(comentarioTable).values({
            nickUsuario,
            idImagen,
            texto
        })
        return newComentario
    }

    static async delete(id: number) {
        const deletedComentario = await db.delete(comentarioTable).where(eq(comentarioTable.id, id))
        return deletedComentario
    }
}