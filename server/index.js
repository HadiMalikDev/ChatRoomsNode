require("dotenv").config();

const express = require("express");
const http = require("http");
const path = require("path");

const connect = require("./db/connect");
const socketServer = require("./websockets/sockets");
const userRouter = require("./routes/user_routes");
const roomRouter = require("./routes/room_routes");
const helmet = require("helmet");
const cors = require("cors");

const app = express();
const router = express.Router();
//Security
app.use(helmet());
app.use(cors());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
//Routers
app.use(userRouter);
app.use(roomRouter);
router.get("/", (req, res) => {
  return res.redirect("/users/login");
});
app.use(router);
app.use(express.static(path.join(__dirname, "../public")));
app.use(function (req, res) {
  // Invalid request
  res.json({
    error: {
      name: "Error",
      status: 404,
      message: "Invalid Request",
      statusCode: 404,
    },
    message: "Testing!",
  });
});

console.log(path.join(__dirname, "../public"));
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

const startApplication = async () => {
  await connect(process.env.MONGO_URI);
  socketServer(server);
  server.listen(PORT, () => {
    console.log("Server up");
  });
};

startApplication();
