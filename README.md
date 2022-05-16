# Full Stack Chat Rooms

This project demonstrates knowledge about working with WebSockets, JWT, Mongoose, Jest and Express.

It also features a basic frontend constructed with the aid of Tailwind CSS.

## Features

Users can create accounts and create, join and leave rooms. Once the user joins a room, they can send messages to the room, which are broadcasted to all other participants of the room.
Messages are kept persistent by storing them in a MongoDB backend. Authentication tokens(jwt) are required to send messages and perform toher operations concerned with rooms
Passwords are hashed before being stored in the database.

## Inspiration:
This project is an... upgraded version of the websockets tutorial video posted by Traversy Media (https://youtu.be/jD7FnbI76Hg). 
The "upgrades" are the persistent storage using mongoose, the ability to load previous messages in chunks(using pagination).
Furthermore, as opposed to the socket.io library used by Brad(the creater of the channel), this project manually implements the grouping of sockets using the ws library.

## Concepts Demonstrated:
- Authentication
- Pagination
- Websockets
- Routing
- Testing
- Persistent Storage

## Main Node Packages Used:

- ws 
- express
- jest
- jsonwebtoken
- mongoose
- tailwindcss
