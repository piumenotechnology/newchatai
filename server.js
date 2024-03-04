import app from './app/index.js'

const PORT = process.env.PORT || 8000;

app.listen (PORT, () => {
    console.log(`server running on port ${PORT}`)
})