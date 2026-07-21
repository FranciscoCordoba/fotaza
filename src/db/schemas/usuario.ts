import { boolean, date, integer, pgTable, varchar, pgEnum } from "drizzle-orm/pg-core";

export const rolEnum = pgEnum('rol', ['usuario', 'moderador', 'admin'])

export const usuarioTable = pgTable('usuario', {
    nickname: varchar({ length: 100 }).primaryKey(),
    password: varchar({ length: 255 }).notNull(),
    correo: varchar({ length: 255 }).notNull().unique(),
    nombre: varchar({ length: 255 }).notNull(),
    rol: rolEnum('rol').default('usuario').notNull(),
    activo: boolean().default(true).notNull(),
    strikes: integer().default(0).notNull(),
    createdAt: date('created_at').defaultNow().notNull(),
})