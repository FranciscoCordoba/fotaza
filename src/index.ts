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

import type { Request, Response, NextFunction } from "express";

app.use((req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token
    const refreshToken = req.cookies.refreshToken

    req.session = {
        user: { nickname: 'usuario1' }
    }

    if (token) {
        try {
            const data = jwt.verify(token, 'secretKey')
            req.session.user = data as any
        } catch {
            // Si el token falló o expiró, intentamos con el refreshToken
            if (refreshToken) {
                try {
                    const data: any = jwt.verify(refreshToken, 'secretKey')
                    req.session.user = { nickname: data.nickname }

                    // Generamos un nuevo token de acceso automáticamente
                    const newToken = jwt.sign({ nickname: data.nickname }, 'secretKey', {
                        expiresIn: '1h'
                    })

                    res.cookie('token', newToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'strict'
                    })
                } catch {
                    // El refreshToken también es inválido o expiró
                }
            }
        }
    } else if (refreshToken) {
        // No hay token, pero sí refreshToken
        try {
            const data: any = jwt.verify(refreshToken, 'secretKey')
            req.session.user = { nickname: data.nickname }

            const newToken = jwt.sign({ nickname: data.nickname }, 'secretKey', {
                expiresIn: '1h'
            })

            res.cookie('token', newToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict'
            })
        } catch { }
    }

    next()
})


const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

export const db = drizzle(pool)