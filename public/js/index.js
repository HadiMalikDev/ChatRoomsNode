const roomsList = document.getElementById("rooms-list")

async function onStart() {
    const response = await fetch('/rooms')
    var rData = await response.json()
    rData.forEach(element => {
        const roomElement = document.createElement("div")
        roomElement.classList.add("room")
        roomElement.innerHTML = `
        <div>
        ${element.name}
        </div>
        <div>
        Total Participants: ${element.totalParticipants}
        </div>
        `
        roomsList.appendChild(roomElement)
    });

}
function validateForm(form) {
    const name = form.elements[name]
    if (name === "") {
        alert("Name cannot be empty")
        return false
    }

    return true
}
onStart()

/*
const ws = new WebSocket('ws://localhost:3000/')
ws.onopen = function () {
    console.log("Connected to the server")
}
ws.onmessage = function (message) {
    console.log("Received", message.data)
}
*/