import { mensajeTable } from "../db/schemas/mensaje.js";
import { db } from "../index.js";
import { and, eq, or } from "drizzle-orm";

export class mensajeModel {

    static async getAll(nickRemitente: string, nickDestinatario: string) {
        const mensajes = await db.select().from(mensajeTable).where(
            and(
                eq(mensajeTable.nickRemitente, nickRemitente),
                eq(mensajeTable.nickDestinatario, nickDestinatario)
            )
        )
        return mensajes
    }

    static async getAllChats(nickUsuario: string) {
        const chats = await db.select().from(mensajeTable).where(
            or(
                eq(mensajeTable.nickRemitente, nickUsuario),
                eq(mensajeTable.nickDestinatario, nickUsuario)
            )
        )
        return chats
    }

    static async create(nickRemitente: string, nickDestinatario: string, contenido: string) {
        const nuevoMensaje = await db.insert(mensajeTable).values({
            nickRemitente,
            nickDestinatario,
            contenido
        }).returning()
        return nuevoMensaje
    }

    static async delete(nickRemitente: string, nickDestinatario: string) {
        const mensajeEliminado = await db.delete(mensajeTable).where(
            and(
                eq(mensajeTable.nickRemitente, nickRemitente),
                eq(mensajeTable.nickDestinatario, nickDestinatario)
            )
        ).returning()
        return mensajeEliminado
    }

}