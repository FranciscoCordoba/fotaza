import { boolean, foreignKey, integer, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";
import { usuarioTable } from "./usuario.js";
import { imagenTable } from "./imagen.js";

export const valoracionTable = pgTable('valoracion', {
    nickUsuario: varchar('nick_usuario', { length: 100 }).notNull(),
    idImagen: integer('id_imagen').notNull(),
    valoracion: integer().notNull(),
    interes: boolean().default(false).notNull()
}, (table) => [
    primaryKey({ columns: [table.nickUsuario, table.idImagen] }),
    foreignKey({
        columns: [table.nickUsuario],
        foreignColumns: [usuarioTable.nickname]
    }),
    foreignKey({
        columns: [table.idImagen],
        foreignColumns: [imagenTable.id]
    })
])