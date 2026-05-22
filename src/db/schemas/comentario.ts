import { date, foreignKey, integer, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { imagenTable } from "./imagen.js";
import { usuarioTable } from "./usuario.js";

export const comentarioTable = pgTable('comentario', {
    id: serial().primaryKey(),
    nickUsuario: varchar('nick_usuario', { length: 100 }).notNull(),
    idImagen: integer('id_imagen').notNull(),
    texto: varchar({ length: 255 }).notNull(),
    createdAt: date('created_at').defaultNow().notNull()
}, (table) => [
    foreignKey({
        columns: [table.idImagen],
        foreignColumns: [imagenTable.id]
    }),
    foreignKey({
        columns: [table.nickUsuario],
        foreignColumns: [usuarioTable.nickname]
    })
])