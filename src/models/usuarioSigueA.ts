import { db } from "../index.js";
import { usuarioSigueATable } from "../db/schemas/usuarioSigueA.js";
import { and, eq } from "drizzle-orm";
import type { usuarioSigueA, usuarioSigueAInsert } from "../utils/types.js";

export class usuarioSigueAModel {

    static async getAll() {
        const suscripciones = await db.select().from(usuarioSigueATable)
        return suscripciones
    }

    static async getAllSeguidos(nickSeguido: string) {
        const suscripciones = await db.select().from(usuarioSigueATable).where(eq(usuarioSigueATable.nickSeguido, nickSeguido))
        return suscripciones
    }

    static async getAllSeguidores(nickSeguidor: string) {
        const suscripciones = await db.select().from(usuarioSigueATable).where(eq(usuarioSigueATable.nickSeguidor, nickSeguidor))
        return suscripciones
    }

    static async create(follow: usuarioSigueAInsert) {
        const { nickSeguidor, nickSeguido } = follow

        const nuevaSuscripcion = await db.insert(usuarioSigueATable).values({
            nickSeguidor,
            nickSeguido
        }).returning()
        return nuevaSuscripcion
    }

    static async delete(nickSeguidor: string, nickSeguido: string) {

        const suscripcionEliminada = await db.delete(usuarioSigueATable).where(
            and(
                eq(usuarioSigueATable.nickSeguidor, nickSeguidor),
                eq(usuarioSigueATable.nickSeguido, nickSeguido)
            )
        ).returning()
        return suscripcionEliminada
    }

}