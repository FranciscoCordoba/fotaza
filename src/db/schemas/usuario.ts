import { boolean, date, pgTable, varchar, serial, integer } from "drizzle-orm/pg-core";

export const rolTable = pgTable('rol', {
    id: serial().primaryKey(),
    nombre: varchar({ length: 100 }).unique().notNull(),
})

export const usuarioTable = pgTable('usuario', {
    nickname: varchar({ length: 100 }).primaryKey(),
    password: varchar({ length: 255 }).notNull(),
    correo: varchar({ length: 255 }).notNull().unique(),
    nombre: varchar({ length: 255 }).notNull(),
    idRol: integer('id_rol').default(1).notNull().references(() => rolTable.id),
    activo: boolean().default(true).notNull(),
    createdAt: date('created_at').defaultNow().notNull(),
})