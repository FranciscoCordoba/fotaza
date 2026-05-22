import { date, foreignKey, integer, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";
import { publicacionTable } from "./publicacion.js";
import { comunidadTable } from "./comunidad.js";

export const publicacionEnComunidadTable = pgTable('publicacion_en_comunidad', {
    idPublicacion: integer('id_publicacion').notNull(),
    nickComunidad: varchar('nick_comunidad', { length: 100 }).notNull(),
    createdAt: date('created_at').defaultNow().notNull()
}, (table) => [
    primaryKey({ columns: [table.idPublicacion, table.nickComunidad] }),
    foreignKey({
        columns: [table.idPublicacion],
        foreignColumns: [publicacionTable.id]
    }),
    foreignKey({
        columns: [table.nickComunidad],
        foreignColumns: [comunidadTable.nickComunidad]
    })
])