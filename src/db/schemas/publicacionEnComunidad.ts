import { date, foreignKey, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";
import { publicacionTable } from "./publicacion.js";
import { comunidadTable } from "./comunidad.js";

export const publicacionEnComunidadTable = pgTable('publicacion_en_comunidad', {
    idPublicacion: varchar('id_publicacion', { length: 100 }),
    nickComunidad: varchar('nick_comunidad', { length: 100 }),
    createdAt: date('created_at').defaultNow().notNull()
}, (table) => [
    primaryKey({ columns: [table.idPublicacion, table.nickComunidad] }),
    foreignKey({
        columns: [table.idPublicacion, table.nickComunidad],
        foreignColumns: [publicacionTable.id, comunidadTable.nickComunidad]
    })
])