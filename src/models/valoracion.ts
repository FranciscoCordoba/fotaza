import { and, eq } from "drizzle-orm";
import { valoracionTable } from "../db/schemas/valoracion.js";
import { db } from "../index.js";

export class valoracionModel {

    static async getAll() {
        const valoraciones = await db.select().from(valoracionTable)
        return valoraciones
    }

    static async getByImage(idImagen: number) {
        const valoraciones = await db.select().from(valoracionTable).where(eq(valoracionTable.idImagen, idImagen))
        return valoraciones
    }

    static async create(nickUsuario: string, idImagen: number, valoracion: number, interes: boolean) {
        const nuevaValoracion = await db.insert(valoracionTable).values({
            nickUsuario,
            idImagen,
            valoracion,
            interes
        }).returning()
        return nuevaValoracion
    }

    static async delete(nickUsuario: string, idImagen: number) {
        const valoracionEliminada = await db.delete(valoracionTable).where(
            and(
                eq(valoracionTable.nickUsuario, nickUsuario),
                eq(valoracionTable.idImagen, idImagen)
            )
        ).returning()
        return valoracionEliminada
    }

}

