import { date, foreignKey, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";
import { usuarioTable } from "./usuario.js";
import { comunidadTable } from "./comunidad.js";

export const usuarioSigueComunidadTable = pgTable('usuario_sigue_comunidad', {
    nickUsuario: varchar('nick_usuario', { length: 100 }),
    nickComunidad: varchar('nick_comunidad', { length: 100 }),
    createdAt: date('created_at').defaultNow().notNull()
}, (table) => [
    primaryKey({ columns: [table.nickUsuario, table.nickComunidad] }),
    foreignKey({
        columns: [table.nickUsuario, table.nickComunidad],
        foreignColumns: [usuarioTable.nickname, comunidadTable.nickComunidad]
    })
])