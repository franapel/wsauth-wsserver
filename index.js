const PORT = process.env.PORT || 80
const ORIGIN = process.env.CLIENT_URL || 'http://localhost:3000'
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:5000/auth'

const express = require('express')
const cors = require('cors')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server, { cors: { origin: ORIGIN } })
const axios = require('axios').default


app.use(cors({ origin: ORIGIN }))

app.get('/', (req, res) => {
    res.send('<h1>hola<h1>');
})

io.on('connection', (socket) => {
    console.log('a user connected')
    socket.on('authenticate', (token) => {
        axios.post(AUTH_URL, token)
        .then(res => console.log(res.data))
        .catch(err => {
            console.log('Authentication error')
            console.log(err)
            socket.disconnect()
        })
    })
    socket.on('disconnect', () => {
        console.log('user disconnected')
    })
    socket.on('msg', (msg) => {
        console.log('message: ' + msg.content);
        socket.emit('msg-response', {
            sender: 'server',
            content: 'Respuesta del servidor al mensaje: ' + msg.content
        })
    })
})

server.listen(PORT, () => {
    console.log('listening on port: ' + PORT);
})