import { date, foreignKey, integer, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";
import { usuarioTable } from "./usuario.js";
import { comentarioTable } from "./comentario.js";

export const denunciaComentarioTable = pgTable('denuncia_comentario', {
    nickUsuario: varchar('nick_usuario', { length: 100 }).notNull(),
    idComentario: integer('id_comentario').notNull(),
    createdAt: date('created_at').defaultNow().notNull()
}, (table) => [
    primaryKey({ columns: [table.nickUsuario, table.idComentario] }),
    foreignKey({
        columns: [table.nickUsuario],
        foreignColumns: [usuarioTable.nickname]
    }),
    foreignKey({
        columns: [table.idComentario],
        foreignColumns: [comentarioTable.id]
    })
])