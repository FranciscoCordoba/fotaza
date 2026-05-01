import { boolean, date, integer, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";
import { userTable } from "./user.js";

export const publicacionTable = pgTable('publicacion', {
    nickUsuario: varchar('nick_usuario', { length: 100 }).references(() => userTable.nickname),
    id: integer(),
    titulo: varchar('nombre', { length: 100 }).notNull(),
    descripcion: varchar('descripcion', { length: 255 }),
    editable: boolean().default(true).notNull(),
    vistas: integer().default(0).notNull(),
    createdAt: date('created_at').defaultNow().notNull()
}, (table) => [
    primaryKey({ columns: [table.id, table.nickUsuario] })
])