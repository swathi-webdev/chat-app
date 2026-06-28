import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

import {connectDB} from './lib/db.js';
import cookieParser from "cookie-parser";
import cors from 'cors';
import {app,server} from './lib/socket.js';
dotenv.config();
import path from "path";

// const express=require('express');
// app.use("/api/auth",authRoutes);


const PORT=process.env.PORT;
const __dirname=path.resolve();
// app.use(express.json());
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(cors({
origin:"http://localhost:5173",
credentials:true
}));
app.use("/api/auth",authRoutes);
app.use("/api/messages",messageRoutes);
if(process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist")))

    app.get("*",(req,res)=>{
        res.sendFile(path.join(__dirname,"../frontend/dist"));
    });
}


// app.listen(PORT,()=>{
//     console.log("server is running on port "+PORT);
//     connectDB();
// });
connectDB();
server.listen(PORT, () => {
    // console.log(`Server is running on port ${PORT}`);
    console.log('server is running on port:' + PORT);
});