import { integer, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";
import { publicacionTable } from "./publicacion.js";

export const etiquetaTable = pgTable('etiqueta', {
    etiqueta: varchar('etiqueta', { length: 100 }).notNull(),
    idPublicacion: integer('id_publicacion').notNull().references(() => publicacionTable.id)
}, (table) => [
    primaryKey({ columns: [table.etiqueta, table.idPublicacion] })
])