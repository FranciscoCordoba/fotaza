import { mensajeTable } from "../db/schemas/mensaje.js";
import { db } from "../index.js";
import { eq, asc } from "drizzle-orm";

export class mensajeModel {

    static async getByConversacion(idConversacion: number) {
        const mensajes = await db.select().from(mensajeTable).where(
            eq(mensajeTable.idConversacion, idConversacion)
        ).orderBy(asc(mensajeTable.createdAt))
        return mensajes
    }

    static async create(idConversacion: number, nickRemitente: string, contenido: string) {
        const nuevoMensaje = await db.insert(mensajeTable).values({
            idConversacion,
            nickRemitente,
            contenido
        }).returning()
        return nuevoMensaje[0]
    }

}