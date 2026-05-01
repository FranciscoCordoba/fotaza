import { boolean, decimal, integer, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";
import { publicacionTable } from "./publicacion.js";

export const imagenTable = pgTable('imagen', {
    id: integer(),
    idPublicacion: varchar('id_publicacion', { length: 100 }).references(() => publicacionTable.id),
    url: varchar({ length: 255 }).notNull().unique(),
    comentariosActivos: boolean('comentarios_activos').default(true).notNull(),
    precio: decimal({ precision: 10, scale: 2 }),
    textoMarcaDeAgua: varchar('texto_marca_de_agua', { length: 100 })
}, (table) => [
    primaryKey({ columns: [table.id, table.idPublicacion] })
])