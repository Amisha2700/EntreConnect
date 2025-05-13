// import express from "express";
// import dotenv from "dotenv";
// //import multer from "multer";
// import cors from 'cors';
// import { connectDb } from "./db.js";
// import { verifyToken } from "./middleware/verifyToken.js";
// import {initializeSocket} from "./socket.js"

// const app=express();
// app.use(cors());

// dotenv.config();//to load the environment variables

// app.use(express.json());

// import authRoutes from "./routes/authRoutes.js";
// import searchRoutes from "./routes/searchRoute.js";
// import chatbotRoutes from "./routes/chatbotRoutes.js";
// import conversationRoutes from "./routes/conversationRoutes.js";
// import messageRoutes from "./routes/messageRoutes.js";

// app.use("/auth",authRoutes);
// app.use("/search", searchRoutes);
// app.use("/api", chatbotRoutes);
// app.use("/api/conversations", verifyToken, conversationRoutes);
// app.use("/api/messages", verifyToken, messageRoutes);

// const server = require("http").Server(app);
// const io=initializeSocket(server);

// app.listen(5050,()=>{
//     connectDb()
// });
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http"; // ✅ Correct ES module import
import { connectDb } from "./db.js";
import { verifyToken } from "./middleware/verifyToken.js";
import { initializeSocket } from "./socket.js";
import { addFeedback } from "./controllers/entreControllers.js";

dotenv.config(); // ✅ Load environment variables

const app = express();
const server = createServer(app); // ✅ Create HTTP server
initializeSocket(server); // ✅ Initialize WebSockets

app.use(cors());
app.use(express.json());

// ✅ Import routes correctly
import authRoutes from "./routes/authRoutes.js";
import searchRoutes from "./routes/searchRoute.js";
import chatbotRoutes from "./routes/chatbotRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

// ✅ Define API routes
app.use("/auth", authRoutes);
app.use("/search", searchRoutes);
app.use("/api", chatbotRoutes);
app.use("/api/conversations", verifyToken, conversationRoutes);
app.use("/api/messages", verifyToken, messageRoutes);
app.use("/addFeedback/:emailid",verifyToken, addFeedback);

// ✅ Start server and connect database
const PORT = process.env.PORT || 5050;
server.listen(PORT, async () => {
  await connectDb();
  console.log(`🚀 Server running on port ${PORT}`);
});
