const ROOM = "First"
const messagesList=document.getElementById("messages")
const ws = new WebSocket('ws://localhost:3000/')


function initializeJoining() {
    const dataToSend = {
        type: 'joinRoom',
        payload: {
            senderId: 'bob',
            roomId: ROOM
        }
    }
    ws.send(JSON.stringify(dataToSend))
}
function joinRoom() {
    if (ws.readyState === ws.OPEN) {
        initializeJoining()
    }
}
function sendMessage() {
    const messageContent=document.getElementById("message").value
    const message={
        type:'sendRoomMessage',
        payload:{
            message:messageContent,
            senderId:'bob',
            roomId:ROOM
        }
    }
    ws.send(JSON.stringify(message))
}
ws.onopen = function () {
    console.log("Connected to the server")
}
ws.onmessage = function messageHandler(msg) {
    const { error, message } = JSON.parse(msg.data)
    if(error){
        return alert(message)
    }
    const para=document.createElement("div")
    para.classList.add('message-wrapper')
    if(!message.sender || message.sender===''){
        //Bot message
        para.classList.add('bot-message')
    }
    else{
        para.classList.add('user-message')
        const messageSender=document.createElement("p")
        messageSender.textContent=message.sender
        messageSender.style.marginRight='10px'
        para.appendChild(messageSender)
    }
    const messageContent=document.createElement("p")
    messageContent.textContent=message.content
    para.appendChild(messageContent)
    messagesList.appendChild(para)
}