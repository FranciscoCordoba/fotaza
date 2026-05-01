import { date, foreignKey, integer, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";
import { userTable } from "./user.js";
import { comentarioTable } from "./comentario.js";

export const denunciaComentarioTable = pgTable('denuncia_comentario', {
    nickUsuario: varchar('nick_usuario', { length: 100 }),
    idComentario: integer('id_comentario'),
    createdAt: date('created_at').defaultNow().notNull()
}, (table) => [
    primaryKey({ columns: [table.nickUsuario, table.idComentario] }),
    foreignKey({
        columns: [table.nickUsuario, table.idComentario],
        foreignColumns: [userTable.nickname, comentarioTable.id]
    })
])