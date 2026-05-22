import { app } from './index.js'
import usuarioRouter from './routes/usuario.js'

const PORT = process.env.PORT || 3001

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

app.use('/usuario', usuarioRouter)

if (!process.env.NODE_ENV) //NODE_ENV ni como produccion ni como tests
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })