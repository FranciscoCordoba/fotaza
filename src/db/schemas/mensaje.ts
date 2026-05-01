import { date, foreignKey, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { userTable } from "./user.js";

export const mensajeTable = pgTable('mensaje', {
    id: serial('id').primaryKey(),
    nickRemitente: varchar('nick_remitente', { length: 100 }).notNull(),
    nickDestinatario: varchar('nick_destinatario', { length: 100 }).notNull(),
    contenido: text('contenido').notNull(),
    createdAt: date('created_at').defaultNow().notNull()
}, (table) => [
    foreignKey({
        columns: [table.nickRemitente, table.nickDestinatario],
        foreignColumns: [userTable.nickname, userTable.nickname]
    })
])