import { eq } from "drizzle-orm";
import { usuarioTable } from "../db/schemas/usuario.js";
import { db } from "../index.js";

export class usuarioModel {

    static async getAll() {
        const usuarios = await db.select().from(usuarioTable)
        return usuarios
    }

    static async getByNickname(nickname: string) {
        const usuario = await db.select().from(usuarioTable).where(eq(usuarioTable.nickname, nickname))
        return usuario
    }

    static async create(nick: string, password: string, nombre: string, correo: string, rol: string) {
        const nuevoUsuario = await db.insert(usuarioTable).values({
            nickname: nick,
            password: password,
            nombre: nombre,
            correo: correo,
            rol: rol
        }).returning()
        return nuevoUsuario
    }

    static async delete(nick: string) {
        const usuarioEliminado = await db.delete(usuarioTable).where(eq(usuarioTable.nickname, nick)).returning()
        return usuarioEliminado
    }

}