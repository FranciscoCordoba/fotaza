import { db } from "../index.js";
import { denunciaComentarioTable } from "../db/schemas/denunciaComentario.js";
import { eq, and } from "drizzle-orm";

export class denunciaComentarioModel {

    static async getAll() {
        const denuncias = await db.select().from(denunciaComentarioTable)
        return denuncias
    }

    static async getAllByComment(idComentario: number) {
        const denuncias = await db.select().from(denunciaComentarioTable).where(eq(denunciaComentarioTable.idComentario, idComentario))
        return denuncias
    }

    static async create(nickUsuario: string, idComentario: number) {
        const nuevaDenuncia = await db.insert(denunciaComentarioTable).values({
            nickUsuario,
            idComentario
        }).returning()
        return nuevaDenuncia
    }

    static async delete(nickUsuario: string, idComentario: number) {
        const denunciaEliminada = await db.delete(denunciaComentarioTable).where(and(eq(denunciaComentarioTable.nickUsuario, nickUsuario), eq(denunciaComentarioTable.idComentario, idComentario))).returning()
        return denunciaEliminada
    }

}
