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

    static async deleteCompleta(idPublicacion: number) {
        const { valoracionTable } = await import("../db/schemas/valoracion.js");
        const { etiquetaTable } = await import("../db/schemas/etiqueta.js");
        const { publicacionEnComunidadTable } = await import("../db/schemas/publicacionEnComunidad.js");
        const { coleccionTable } = await import("../db/schemas/coleccion.js");
        const { imagenTable } = await import("../db/schemas/imagen.js");
        const { denunciaImagenTable } = await import("../db/schemas/denunciaImagen.js");
        const { comentarioTable } = await import("../db/schemas/comentario.js");
        const { denunciaComentarioTable } = await import("../db/schemas/denunciaComentario.js");

        await db.delete(etiquetaTable).where(eq(etiquetaTable.idPublicacion, idPublicacion));
        await db.delete(publicacionEnComunidadTable).where(eq(publicacionEnComunidadTable.idPublicacion, idPublicacion));
        await db.delete(coleccionTable).where(eq(coleccionTable.idPublicacion, idPublicacion));

        const imagenes = await db.select({ id: imagenTable.id }).from(imagenTable).where(eq(imagenTable.idPublicacion, idPublicacion));
        const imgIds = imagenes.map(img => img.id);

        if (imgIds.length > 0) {
            const comentarios = await db.select({ id: comentarioTable.id }).from(comentarioTable).where(inArray(comentarioTable.idImagen, imgIds));
            const comIds = comentarios.map(c => c.id);

            if (comIds.length > 0) {
                await db.delete(denunciaComentarioTable).where(inArray(denunciaComentarioTable.idComentario, comIds));
            }

            await db.delete(denunciaImagenTable).where(inArray(denunciaImagenTable.idImagen, imgIds));
            await db.delete(valoracionTable).where(inArray(valoracionTable.idImagen, imgIds));
            await db.delete(comentarioTable).where(inArray(comentarioTable.idImagen, imgIds));
            await db.delete(imagenTable).where(inArray(imagenTable.id, imgIds));
        }

        await db.delete(publicacionTable).where(eq(publicacionTable.id, idPublicacion));
    }

}