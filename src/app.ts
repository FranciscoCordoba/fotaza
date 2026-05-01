import { app } from './index.js'

const PORT = process.env.PORT || 3001

if (!process.env.NODE_ENV) //NODE_ENV ni como produccion ni como tests
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
    })