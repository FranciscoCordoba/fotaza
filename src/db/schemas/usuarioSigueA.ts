import { date, foreignKey, pgTable, primaryKey, varchar } from "drizzle-orm/pg-core";
import { userTable } from "./user.js";

export const usuarioSigueATable = pgTable('usuario_sigue_a', {
    nickSeguidor: varchar('nick_seguidor', { length: 100 }).notNull(),
    nickSeguido: varchar('nick_seguido', { length: 100 }).notNull(),
    createdAt: date('created_at').defaultNow().notNull()
}, (table) => [
    primaryKey({ columns: [table.nickSeguidor, table.nickSeguido] }),
    foreignKey({
        columns: [table.nickSeguidor, table.nickSeguido],
        foreignColumns: [userTable.nickname, userTable.nickname]
    })
])