import { date, foreignKey, integer, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";
import { conversacionTable } from "./conversacion.js";
import { usuarioTable } from "./usuario.js";

export const mensajeTable = pgTable('mensaje', {
    id: serial('id').primaryKey(),
    idConversacion: integer('id_conversacion').notNull(),
    nickRemitente: varchar('nick_remitente', { length: 100 }).notNull(),
    contenido: text('contenido').notNull(),
    createdAt: date('created_at').defaultNow().notNull()
}, (table) => [
    foreignKey({
        columns: [table.idConversacion],
        foreignColumns: [conversacionTable.id]
    }),
    foreignKey({
        columns: [table.nickRemitente],
        foreignColumns: [usuarioTable.nickname]
    })
])