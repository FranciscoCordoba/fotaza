import { and, eq } from "drizzle-orm";
import { interesTable } from "../db/schemas/interes.js";
import { db } from "../index.js";

export class interesModel {
    static async getAll() {
        const interes = await db.select().from(interesTable)
        return interes
    }

    static async getByNicknames(nickUsuario: string, idImagen: number) {
        const [interes] = await db.select().from(interesTable).where(and(eq(interesTable.nickUsuario, nickUsuario), eq(interesTable.idImagen, idImagen)))
        return interes
    }

    static async create(nickUsuario: string, idImagen: number) {
        const nuevoInteres = await db.insert(interesTable).values({
            nickUsuario,
            idImagen,
        }).returning()
        return nuevoInteres
    }

    static async delete(nickUsuario: string, idImagen: number) {
        const interesEliminado = await db.delete(interesTable).where(and(eq(interesTable.nickUsuario, nickUsuario), eq(interesTable.idImagen, idImagen))).returning()
        return interesEliminado
    }
}