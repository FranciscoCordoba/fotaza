import { boolean, integer, pgTable, real, serial, varchar } from "drizzle-orm/pg-core";
import { publicacionTable } from "./publicacion.js";

export const imagenTable = pgTable('imagen', {
    id: serial().primaryKey(),
    idPublicacion: integer('id_publicacion').notNull().references(() => publicacionTable.id),
    url: varchar({ length: 255 }).notNull().unique(),
    comentariosActivos: boolean('comentarios_activos').default(true).notNull(),
    precio: real(),
    textoMarcaDeAgua: varchar('texto_marca_de_agua', { length: 100 })
})