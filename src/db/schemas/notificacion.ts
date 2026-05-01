import { boolean, date, pgTable, primaryKey, serial, varchar } from "drizzle-orm/pg-core";
import { userTable } from "./user.js";

export const notificacionTable = pgTable('notificacion', {
    id: serial('id'),
    nickname: varchar({ length: 100 }).references(() => userTable.nickname),
    fuenteTipo: varchar('fuente_tipo', { length: 100 }).notNull(),
    fuenteId: varchar('fuente_id', { length: 100 }).notNull(),
    texto: varchar({ length: 255 }).notNull(),
    createdAt: date('created_at').defaultNow().notNull(),
    vista: boolean().default(false).notNull()
}, (table) => [
    primaryKey({ columns: [table.nickname, table.id] })
])