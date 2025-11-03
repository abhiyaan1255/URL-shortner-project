import express from "express"
import path from "path"
import router from "./routes/routes.js"
import cookieParser from "cookie-parser";
import session from "express-session"
import flash from "connect-flash"
import requestIp from "request-ip"

import { PORT } from "./config/env.js"
import { authRoute } from "./routes/auth.routes.js"
import {verifyAuthentication} from "./middlewares/virify.auth-middleware.js"
const app=express()

app.use(session({secret:process.env.MY_SECRATE,resave:true,saveUninitialized:false}))
app.use(express.json());

app.set("view engine","ejs")
app.use(express.static(path.join(import.meta.dirname,"style")))
app.use(cookieParser())

//middlewares
//this are use for throw error

app.use(flash())
// this is must be after cookieparse
app.use(requestIp.mw())
app.use(verifyAuthentication)
app.use((req,res,next)=>{
    res.locals.user=req.user
    return next()
})

app.use(express.urlencoded({ extended: true }))

app.use(authRoute)
app.use(router)
app.listen(PORT,()=>{
    console.log(PORT);
    
})