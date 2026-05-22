import { date, foreignKey, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { usuarioTable } from "./usuario.js";

export const mensajeTable = pgTable('mensaje', {
    id: serial('id').primaryKey(),
    nickRemitente: varchar('nick_remitente', { length: 100 }).notNull(),
    nickDestinatario: varchar('nick_destinatario', { length: 100 }).notNull(),
    contenido: text('contenido').notNull(),
    createdAt: date('created_at').defaultNow().notNull()
}, (table) => [
    foreignKey({
        columns: [table.nickRemitente],
        foreignColumns: [usuarioTable.nickname]
    }),
    foreignKey({
        columns: [table.nickDestinatario],
        foreignColumns: [usuarioTable.nickname]
    })
])