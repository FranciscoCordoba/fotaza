import { date, foreignKey, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";
import { usuarioTable } from "./usuario.js";
import { comunidadTable } from "./comunidad.js";

export const usuarioSigueComunidadTable = pgTable('usuario_sigue_comunidad', {
    nickUsuario: varchar('nick_usuario', { length: 100 }).notNull(),
    nickComunidad: varchar('nick_comunidad', { length: 100 }).notNull(),
    createdAt: date('created_at').defaultNow().notNull()
}, (table) => [
    primaryKey({ columns: [table.nickUsuario, table.nickComunidad] }),
    foreignKey({
        columns: [table.nickUsuario],
        foreignColumns: [usuarioTable.nickname]
    }),
    foreignKey({
        columns: [table.nickComunidad],
        foreignColumns: [comunidadTable.nickComunidad]
    })
])