import { boolean, date, integer, pgTable, varchar } from "drizzle-orm/pg-core";
import { usuarioTable } from "./usuario.js";

export const publicacionTable = pgTable('publicacion', {
    nickUsuario: varchar('nick_usuario', { length: 100 }).notNull().references(() => usuarioTable.nickname),
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    titulo: varchar('nombre', { length: 100 }).notNull(),
    descripcion: varchar('descripcion', { length: 255 }),
    editable: boolean().default(true).notNull(),
    vistas: integer().default(0).notNull(),
    createdAt: date('created_at').defaultNow().notNull()
})