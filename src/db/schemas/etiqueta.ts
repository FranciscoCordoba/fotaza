import { pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";
import { publicacionTable } from "./publicacion.js";

export const etiquetaTable = pgTable('etiqueta', {
    etiqueta: varchar('etiqueta', { length: 100 }),
    idPublicacion: varchar('id_publicacion', { length: 100 }).references(() => publicacionTable.id)
}, (table) => [
    primaryKey({ columns: [table.etiqueta, table.idPublicacion] })
])