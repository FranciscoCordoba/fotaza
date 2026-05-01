import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import express from 'express'
import { join } from 'node:path'

process.loadEnvFile()


export const app = express()

app.set('views', join(import.meta.dirname, 'views'))
app.set('view engine', 'pug')

app.use(express.json())

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})
export const db = drizzle(pool)


