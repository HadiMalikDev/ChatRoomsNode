const roomsList = document.getElementById("rooms-list")

async function onStart() {
    const response = await fetch('/rooms')
    var rData = await response.json()
    console.log(rData)
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
        console.log(element.name)
        console.log(element.totalParticipants)
        console.log(roomsList)
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