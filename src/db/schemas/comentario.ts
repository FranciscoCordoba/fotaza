import { date, foreignKey, integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { imagenTable } from "./imagen.js";
import { userTable } from "./user.js";

export const comentarioTable = pgTable('comentario', {
    id: integer().primaryKey(),
    nickUsuario: varchar('nick_usuario', { length: 100 }).notNull(),
    idImagen: integer('id_imagen').notNull(),
    texto: varchar({ length: 255 }).notNull(),
    createdAt: date('created_at').defaultNow().notNull()
}, (table) => [
    foreignKey({
        columns: [table.idImagen, table.nickUsuario],
        foreignColumns: [imagenTable.id, userTable.nickname]
    })
])