import { db } from "../index.js";
import { denunciaComentarioTable } from "../db/schemas/denunciaComentario.js";
import { comentarioTable } from "../db/schemas/comentario.js";
import { imagenTable } from "../db/schemas/imagen.js";
import { publicacionTable } from "../db/schemas/publicacion.js";
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

    static async getDenunciasPorAutorPublicacion(nickname: string) {
        const denuncias = await db.select({
            denuncia: denunciaComentarioTable,
            comentario: comentarioTable,
            imagen: imagenTable,
            publicacion: publicacionTable
        })
            .from(denunciaComentarioTable)
            .innerJoin(comentarioTable, eq(denunciaComentarioTable.idComentario, comentarioTable.id))
            .innerJoin(imagenTable, eq(comentarioTable.idImagen, imagenTable.id))
            .innerJoin(publicacionTable, eq(imagenTable.idPublicacion, publicacionTable.id))
            .where(eq(publicacionTable.nickUsuario, nickname));
        return denuncias;
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

    static async deleteAllByComment(idComentario: number) {
        const denunciasEliminadas = await db.delete(denunciaComentarioTable).where(eq(denunciaComentarioTable.idComentario, idComentario)).returning();
        return denunciasEliminadas;
    }
}
