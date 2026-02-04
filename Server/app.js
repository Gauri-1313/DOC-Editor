const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/DOCEDITOR")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Server + Socket
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Model
const Document = require("./models/Document");

// Socket logic
io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("get-document", async (id) => {
    const document = await findOrCreateDocument(id);
    socket.join(id);
    socket.emit("load-document", document.content);

    socket.on("send-changes", (data) => {
      socket.broadcast.to(id).emit("receive-changes", data);
    });

    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(id, { content: data });
    });
  });
});

// Helper function
async function findOrCreateDocument(id) {
  if (!id) return;

  const document = await Document.findById(id);
  if (document) return document;

  return await Document.create({
    _id: id,
    content: "",
  });
}

// Start server
server.listen(5000, () => {
  console.log("Server running on port 5000");
});
