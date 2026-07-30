import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import express from 'express'
import { join } from 'node:path'
import cookieParser from "cookie-parser"
import jwt from "jsonwebtoken"

try {
    process.loadEnvFile()
} catch (error) {
    // Ignorar en producción si no existe el archivo .env
}


export const app = express()

app.set('views', join(import.meta.dirname, 'views'))
app.set('view engine', 'pug')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static(join(import.meta.dirname, 'public')))

import type { Request, Response, NextFunction } from "express";

export const JWT_SECRET = process.env.JWT_SECRET || 'secretKey'

const renovarToken = (refreshToken: string, req: Request, res: Response) => {
    try {
        const data: any = jwt.verify(refreshToken, JWT_SECRET)
        req.session = req.session || {}
        req.session.user = { nickname: data.nickname }

        const newToken = jwt.sign({ nickname: data.nickname }, JWT_SECRET, {
            expiresIn: '1h'
        })

        res.cookie('token', newToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        })
    } catch {
        // El refreshToken es inválido o expiró
    }
}

app.use((req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token
    const refreshToken = req.cookies.refreshToken

    req.session = {
        user: null
    }

    if (token) {
        try {
            const data = jwt.verify(token, JWT_SECRET)
            req.session.user = data as any
        } catch {
            // Si el token falló o expiró, intentamos con el refreshToken
            if (refreshToken) {
                renovarToken(refreshToken, req, res)
            }
        }
    } else if (refreshToken) {
        // No hay token, pero sí refreshToken
        renovarToken(refreshToken, req, res)
    }

    res.locals.user = req.session.user
    res.locals.currentPath = req.path

    next()
})


const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

export const db = drizzle(pool)