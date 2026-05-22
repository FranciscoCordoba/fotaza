import { eq } from "drizzle-orm";
import { usuarioTable } from "../db/schemas/usuario.js";
import { db } from "../index.js";
import type { usuarioInsert } from "../utils/types.js";

export class usuarioModel {

    static async getAll() {
        const usuarios = await db.select().from(usuarioTable)
        return usuarios
    }

    static async getByNickname(nickname: string) {
        const [usuario] = await db.select().from(usuarioTable).where(eq(usuarioTable.nickname, nickname))
        return usuario
    }

    static async create(newUsuario: usuarioInsert) {
        const [nuevoUsuario] = await db.insert(usuarioTable).values(newUsuario).returning()

        if (nuevoUsuario) {
            const { password, ...usuarioPublico } = nuevoUsuario
            return usuarioPublico
        }
        return undefined
    }

    static async delete(nick: string) {
        const usuarioEliminado = await db.delete(usuarioTable).where(eq(usuarioTable.nickname, nick)).returning()
        return usuarioEliminado
    }

}