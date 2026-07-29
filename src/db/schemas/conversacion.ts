import { date, foreignKey, pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { usuarioTable } from "./usuario.js";

export const conversacionTable = pgTable('conversacion', {
    id: serial('id').primaryKey(),
    nickUsuario1: varchar('nick_usuario_1', { length: 100 }).notNull(),
    nickUsuario2: varchar('nick_usuario_2', { length: 100 }).notNull(),
    createdAt: date('created_at').defaultNow().notNull()
}, (table) => [
    foreignKey({
        columns: [table.nickUsuario1],
        foreignColumns: [usuarioTable.nickname]
    }),
    foreignKey({
        columns: [table.nickUsuario2],
        foreignColumns: [usuarioTable.nickname]
    })
])
