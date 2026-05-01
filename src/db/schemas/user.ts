import { boolean, date, pgTable, varchar } from "drizzle-orm/pg-core";

export const userTable = pgTable('user', {
    nickname: varchar({ length: 100 }).primaryKey(),
    password: varchar({ length: 255 }).notNull(),
    correo: varchar({ length: 255 }).notNull().unique(),
    nombre: varchar({ length: 255 }).notNull(),
    rol: varchar({ length: 255 }).notNull(),
    activo: boolean().notNull(),
    createdAt: date('created_at').defaultNow().notNull(),
})