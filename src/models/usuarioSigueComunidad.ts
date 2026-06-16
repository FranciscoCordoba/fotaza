import { and, eq } from "drizzle-orm";
import { usuarioSigueComunidadTable } from "../db/schemas/usuarioSigueComunidad.js";
import { db } from "../index.js";

export class usuarioSigueComunidadModel {

    static async getAll() {
        const suscripciones = await db.select().from(usuarioSigueComunidadTable)
        return suscripciones
    }

    static async getByNickname(nickUsuario: string) {
        const suscripciones = await db.select().from(usuarioSigueComunidadTable).where(eq(usuarioSigueComunidadTable.nickUsuario, nickUsuario))
        return suscripciones
    }

    static async getByNicknames(nickUsuario: string, nickComunidad: string) {
        const suscripcion = await db.select().from(usuarioSigueComunidadTable).where(
            and(
                eq(usuarioSigueComunidadTable.nickUsuario, nickUsuario),
                eq(usuarioSigueComunidadTable.nickComunidad, nickComunidad)
            )
        )
        return suscripcion[0]
    }

    static async getByComunidad(nickComunidad: string) {
        const suscripciones = await db.select().from(usuarioSigueComunidadTable).where(eq(usuarioSigueComunidadTable.nickComunidad, nickComunidad))
        return suscripciones
    }

    static async create(nickUsuario: string, nickComunidad: string) {
        const nuevaSuscripcion = await db.insert(usuarioSigueComunidadTable).values({
            nickUsuario,
            nickComunidad
        }).returning()
        return nuevaSuscripcion
    }

    static async delete(nickUsuario: string, nickComunidad: string) {
        const suscripcionEliminada = await db.delete(usuarioSigueComunidadTable).where(
            and(
                eq(usuarioSigueComunidadTable.nickUsuario, nickUsuario),
                eq(usuarioSigueComunidadTable.nickComunidad, nickComunidad)
            )
        ).returning()
        return suscripcionEliminada
    }

}