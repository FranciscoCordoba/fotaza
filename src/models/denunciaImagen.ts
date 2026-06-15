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

    static async create(nickUsuario: string, idImagen: number, motivo: string, idEvaluacion: number) {
        const nuevaDenuncia = await db.insert(denunciaImagenTable).values({
            nickUsuario,
            idImagen,
            motivo,
            idEvaluacion
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
}