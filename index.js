require('dotenv').config()
const PORT = process.env.PORT || 80
const ORIGIN = process.env.CLIENT_URL

const express = require('express')
const cors = require('cors')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server, { cors: { origin: ORIGIN } })
const axios = require('axios').default
const jwt = require('jsonwebtoken')

app.use(cors({ origin: ORIGIN }))

console.log(ORIGIN)

app.get('/', (req, res) => {
    res.send('<h1>hola<h1>');
})

io.on('connection', (socket) => {
    console.log('a user connected')
    socket.on('authenticate', (creds) => {
        const token = creds.token.split(' ')[1]
        jwt.verify(token, 'secreto', (err, decoded) => {
            if (err) {
                console.log('Socket Authentication error')
                socket.disconnect()
            } else {
                if (decoded.sub !== creds.user_id) {
                    console.log('Wrong user')
                    socket.disconnect()
                } else {
                    console.log('Authorization successful')
                }
            }
        })
        // axios.post(AUTH_URL+'/auth', token)
        // .then(res => console.log(res.data))
        // .catch(err => {
        //     console.log('Authentication error')
        //     socket.disconnect()
        // })
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