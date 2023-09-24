import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import morgan from "morgan";
import * as middleware from "./utils/middleware.js";
import helloRoute from "./routes/helloRouter.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 1. Consider breaking these middleware and route definitions into separate modules for better organization.

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("tiny"));

// Healthcheck endpoint
app.get("/", (req, res) => {
  res.status(200).send({ status: "ok" });
});

// Express routes
app.use("/hello", helloRoute);

// Custom middleware
app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

// 2. Consider using environment variables for configuration settings such as the HTTP and WebSocket ports.
const PORT = process.env.PORT || 3001;

// Handle WebSocket connections
io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Handle incoming messages from clients
  socket.on("message", (message) => {
    // Broadcast the message to all connected clients (including the sender)
    io.emit("message", message);
  });

  // Handle disconnections
  socket.on("disconnect", () => {
    console.log(`A user disconnected: ${socket.id}`);
  });
});

// 3. Consider adding a try-catch block for error handling during server startup.
try {
  // Start the server
  server.listen(PORT, () => {
    console.log(`WebSocket server is running on port ${PORT}`);
  });
} catch (error) {
  console.error("Server startup error:", error);
}

// Export the Express app and server if needed.
export default { app, server };
