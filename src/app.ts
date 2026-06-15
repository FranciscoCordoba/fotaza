import { app } from './index.js'
import usuarioRouter from './routes/usuario.js'
import authRouter from './routes/auth.js'
import publicacionRouter from './routes/publicacion.js'
import feedRouter from './routes/feed.js'
import comunidadRouter from './routes/comunidad.js'

const PORT = process.env.PORT || 3000

app.get('/', (req, res) => {
    if (req?.session?.user)
        res.redirect('/feed')

    res.redirect('/auth/login')
})


// app.get('/feed', (req, res) => {
//     res.render('feed')
// })


app.use('/auth', authRouter)
app.use('/usuario', usuarioRouter)
app.use('/publicacion', publicacionRouter)
app.use('/feed', feedRouter)
app.use('/comunidad', comunidadRouter)

if (!process.env.NODE_ENV) //NODE_ENV ni como produccion ni como tests
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })

export default app;