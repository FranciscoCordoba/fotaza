import { db } from "../index.js"
import { denunciaImagenTable } from "../db/schemas/denunciaImagen.js"
import { and, eq } from "drizzle-orm"

export class denunciaImagenModel {
    static async getAll() {
        const denuncias = await db.select().from(denunciaImagenTable)
        return denuncias
    }

    static async getByImage(idImagen: number) {
        const denuncias = await db.select().from(denunciaImagenTable).where(eq(denunciaImagenTable.idImagen, idImagen))
        return denuncias
    }

    static async create(nickUsuario: string, idImagen: number, idMotivo: number, descripcion?: string) {
        const nuevaDenuncia = await db.insert(denunciaImagenTable).values({
            nickUsuario,
            idImagen,
            idMotivo,
            descripcion
        }).returning()
        return nuevaDenuncia
    }

    static async delete(nickUsuario: string, idImagen: number) {
        const denunciaEliminada = await db.delete(denunciaImagenTable).where(
            and(
                eq(denunciaImagenTable.nickUsuario, nickUsuario),
                eq(denunciaImagenTable.idImagen, idImagen)
            )
        ).returning()
        return denunciaEliminada
    }

    static async getMotivos() {
        const { motivoDenunciaTable } = await import("../db/schemas/denunciaImagen.js");
        const motivos = await db.select().from(motivoDenunciaTable);
        return motivos;
    }

    static async getByUsuarioAndImagen(nickUsuario: string, idImagen: number) {
        const denuncia = await db.select().from(denunciaImagenTable).where(
            and(
                eq(denunciaImagenTable.nickUsuario, nickUsuario),
                eq(denunciaImagenTable.idImagen, idImagen)
            )
        );
        return denuncia[0];
    }

    static async getAllWithDetails() {
        const { motivoDenunciaTable } = await import("../db/schemas/denunciaImagen.js");
        const { imagenTable } = await import("../db/schemas/imagen.js");
        const { publicacionTable } = await import("../db/schemas/publicacion.js");

        return await db.select({
            denuncia: denunciaImagenTable,
            motivo: motivoDenunciaTable,
            imagen: imagenTable,
            publicacion: publicacionTable
        })
        .from(denunciaImagenTable)
        .innerJoin(motivoDenunciaTable, eq(denunciaImagenTable.idMotivo, motivoDenunciaTable.id))
        .innerJoin(imagenTable, eq(denunciaImagenTable.idImagen, imagenTable.id))
        .innerJoin(publicacionTable, eq(imagenTable.idPublicacion, publicacionTable.id));
    }

    static async updateEstado(nickUsuario: string, idImagen: number, estado: 'pendiente' | 'aceptada' | 'rechazada') {
        return await db.update(denunciaImagenTable)
            .set({ estado })
            .where(
                and(
                    eq(denunciaImagenTable.nickUsuario, nickUsuario),
                    eq(denunciaImagenTable.idImagen, idImagen)
                )
            ).returning();
    }
}