import { and, eq, avg, count } from "drizzle-orm";
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

    static async create(nickUsuario: string, idImagen: number, valoracion: number) {
        const nuevaValoracion = await db.insert(valoracionTable).values({
            nickUsuario,
            idImagen,
            valoracion
        }).onConflictDoUpdate({
            target: [valoracionTable.nickUsuario, valoracionTable.idImagen],
            set: { valoracion }
        }).returning()
        return nuevaValoracion
    }

    static async getStatsByImage(idImagen: number) {
        const result = await db.select({
            promedio: avg(valoracionTable.valoracion),
            cantidad: count(valoracionTable.valoracion)
        }).from(valoracionTable).where(eq(valoracionTable.idImagen, idImagen))

        const row = result[0]
        return {
            promedio: row && row.promedio ? Number(row.promedio).toFixed(2) : "0.00",
            cantidad: row && row.cantidad ? row.cantidad : 0
        }
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

