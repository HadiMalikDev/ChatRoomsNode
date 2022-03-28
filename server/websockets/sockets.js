const websocket = require('websocket')

//Broadcasts to all except sending client
const modifiedBroadcast = (webserver, self, message) => {
    webserver.connections.forEach((connection) => {
        if (connection != self)
            connection.send(message)
    })
}

module.exports = (server) => {

    const wss = new websocket.server({
        httpServer: server,
        autoAcceptConnections: true
    })
    wss.on('connect', (conn) => {
        conn.send("Send")
        conn.on('message', (messageSocket) => {
            console.log(messageSocket)
            const { payload, type } = JSON.parse(messageSocket.utf8Data)
            if (type === 'messageSend') {
                const { message } = payload
                modifiedBroadcast(wss, conn, message)
            }
        })
    })
}

