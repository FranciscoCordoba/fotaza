import { conversacionTable } from "../db/schemas/conversacion.js";
import { db } from "../index.js";
import { and, eq, or } from "drizzle-orm";

export class conversacionModel {
    static async getByUsers(nick1: string, nick2: string) {
        const conversaciones = await db.select().from(conversacionTable).where(
            or(
                and(eq(conversacionTable.nickUsuario1, nick1), eq(conversacionTable.nickUsuario2, nick2)),
                and(eq(conversacionTable.nickUsuario1, nick2), eq(conversacionTable.nickUsuario2, nick1))
            )
        )
        return conversaciones[0]
    }

    static async getByUsuario(nick: string) {
        const conversaciones = await db.select().from(conversacionTable).where(
            or(
                eq(conversacionTable.nickUsuario1, nick),
                eq(conversacionTable.nickUsuario2, nick)
            )
        )
        return conversaciones
    }

    static async getById(id: number) {
        const conversaciones = await db.select().from(conversacionTable).where(eq(conversacionTable.id, id))
        return conversaciones[0]
    }

    static async create(nick1: string, nick2: string) {
        const nuevaConversacion = await db.insert(conversacionTable).values({
            nickUsuario1: nick1,
            nickUsuario2: nick2
        }).returning()
        return nuevaConversacion[0]
    }
}
