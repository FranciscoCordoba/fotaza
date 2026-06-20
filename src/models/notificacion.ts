import { notificacionTable } from "../db/schemas/notificacion.js";
import { db } from "../index.js";
import { and, eq, desc } from "drizzle-orm";

export class notificacionModel {

    static async getAll() {
        const notificaciones = await db.select().from(notificacionTable)
        return notificaciones
    }

    static async getByNickname(nickUsuario: string) {
        const notificaciones = await db.select()
            .from(notificacionTable)
            .where(eq(notificacionTable.nickRecepcion, nickUsuario))
            .orderBy(desc(notificacionTable.id));
        return notificaciones
    }

    static async create(nickGeneracion: string, nickRecepcion: string, fuenteTipo: string) {
        const nuevaNotificacion = await db.insert(notificacionTable).values({
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

    static async marcarComoVista(id: number, nickRecepcion: string) {
        const result = await db.update(notificacionTable)
            .set({ vista: true })
            .where(and(eq(notificacionTable.id, id), eq(notificacionTable.nickRecepcion, nickRecepcion)))
            .returning();
        return result;
    }

}