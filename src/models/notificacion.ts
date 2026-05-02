import { notificacionTable } from "../db/schemas/notificacion.js";
import { db } from "../index.js";
import { and, eq } from "drizzle-orm";

export class notificacionModel {

    static async getAll() {
        const notificaciones = await db.select().from(notificacionTable)
        return notificaciones
    }

    static async getByNickname(nickUsuario: string) {
        const notificaciones = await db.select().from(notificacionTable).where(eq(notificacionTable.nickRecepcion, nickUsuario))
        return notificaciones
    }

    static async create(texto: string, nickGeneracion: string, nickRecepcion: string, fuenteTipo: string) {
        const nuevaNotificacion = await db.insert(notificacionTable).values({
            texto,
            nickGeneracion,
            nickRecepcion,
            fuenteTipo
        }).returning()
        return nuevaNotificacion
    }

    static async delete(id: number) {
        const notificacionEliminada = await db.delete(notificacionTable).where(eq(notificacionTable.id, id)).returning()
        return notificacionEliminada
    }

}