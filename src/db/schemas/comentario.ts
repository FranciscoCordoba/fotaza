import { date, foreignKey, integer, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";
import { imagenTable } from "./imagen.js";
import { userTable } from "./user.js";

export const comentarioTable = pgTable('comentario', {
    id: integer(),
    nickUsuario: varchar('nick_usuario', { length: 100 }),
    idImagen: integer('id_imagen'),
    texto: varchar({ length: 255 }).notNull(),
    createdAt: date('created_at').defaultNow().notNull()
}, (table) => [
    primaryKey({ columns: [table.id, table.nickUsuario, table.idImagen] }),
    foreignKey({
        columns: [table.idImagen, table.nickUsuario],
        foreignColumns: [imagenTable.id, userTable.nickname]
    })
])