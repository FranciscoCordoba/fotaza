import { foreignKey, integer, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";
import { usuarioTable } from "./usuario.js";
import { publicacionTable } from "./publicacion.js";

export const coleccionTable = pgTable('coleccion', {
    nickUsuario: varchar('nick_usuario', { length: 100 }).notNull(),
    nickColeccion: varchar('nick_coleccion', { length: 100 }).notNull(),
    idPublicacion: integer('id_publicacion').notNull()
}, (table) => [
    primaryKey({ columns: [table.nickUsuario, table.nickColeccion, table.idPublicacion] }),
    foreignKey({
        columns: [table.nickUsuario],
        foreignColumns: [usuarioTable.nickname]
    }),
    foreignKey({
        columns: [table.idPublicacion],
        foreignColumns: [publicacionTable.id]
    })
])