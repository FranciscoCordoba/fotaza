import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import express from 'express'
import { join } from 'node:path'
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"

process.loadEnvFile()


export const app = express()

app.set('views', join(import.meta.dirname, 'views'))
app.set('view engine', 'pug')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use((req, res, next) => {
    const token = req.cookies.token

    req.session = { user: null }

    try {
        const data = jwt.verify(token, 'secretKey')
        req.session.user = data
    } catch { }

    next()
})


const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

export const db = drizzle(pool)