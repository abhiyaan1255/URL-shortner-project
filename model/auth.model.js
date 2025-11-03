import { db } from "../config/db.js";
import {sessionsTable, shortLinksTable, usersTable,verifyEmailTokensTable} from "../drizzle/schema.js"
import { and, eq,gte,lt,sql } from "drizzle-orm";
import  argon2  from "argon2";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { error } from "console";
// import {usersTable} from "../drizzle/schema.js"
export const authModelPostRegister=async({name,email,password})=>{
  const [user]= await db.insert(usersTable).values({
    name:name,
    email:email,
    password:password
  }).$returningId();
  return user
}

export const authModelgetUserByEmail=async(email)=>{
  const [user]=await db.select().from(usersTable).where(eq(
    usersTable.email,email
  ))
  return user
}

export const authPostPassExist=async({password,hash})=>{
    // in argon 2 hash password always comes first
   return argon2.verify(hash,password)
}

export const hashPassword=async(password)=>{
 return argon2.hash(password)
}



export const createSession=async(userId,{ip,userAgent})=>{
 const [session]= await db
  .insert(sessionsTable)
  .values({userId,ip,userAgent})
  .$returningId()
  return session
}
export const createAccessToken=({id,name,email,sessionId})=>{
 return jwt.sign({id,name,email,sessionId},process.env.JWT_SECRATE,{
  expiresIn:"15m"
 })
}

export const createRefreshToken=(sessionId)=>{
 return jwt.sign({sessionId},process.env.JWT_SECRATE,{
  expiresIn:"7d"
 })
}


export const verifyJWTToke=({token})=>{
    try {
        //  console.log(" 59 Token verification succes");
        return jwt.verify(token,process.env.JWT_SECRATE)
    } catch (error) {
        console.log("auth.modol.js 60 Token verification error",error.message);
    }
}


export const findUserById=async(userId)=>{
  const [user] = await db
  .select()
  .from(usersTable)
  .where(eq(usersTable.id,userId))
  return user
}
export const findSessionById=async(sessionId)=>{
 const [session]= await db
   .select()
   .from(sessionsTable)
   .where(eq(sessionsTable.id,sessionId))
   return session
}

export const refreshTokens=async(refreshToken)=>{
  // console.log(refreshToken);
  
 try {
  const decodedToken=verifyJWTToke({token:refreshToken})
  // console.log("de",decodedToken);
  
  const currentSession=await findSessionById(decodedToken.sessionId)
  // console.log(currentSession,"currentsession");
  
  if(!currentSession || !currentSession.vaild){
    throw new Error ("envalid session")
  }
  const user =await findUserById(currentSession.userId)
  // console.log("user 12334",user,currentSession.userId);
  
  if(!user) throw new Error("invalid user")
    const userInfo={
  id:user.id,
  name:user.name,
email:user.email,
isEmailValid:user.isEmailValid,
sessionId:currentSession.id
}
const newAccessToken=createAccessToken(userInfo)
// console.log("newAccessToken",newAccessToken);

const newRefreshToken=createRefreshToken(currentSession.id)
return{
  newAccessToken,
  newRefreshToken,
  user:userInfo
}
 } catch (error) {
  console.log(error.message);
  
 }
}

export const clearUserSession=async(sessionId)=>{
  return db.delete(sessionsTable).where(eq(sessionsTable.id,sessionId))
}

export const authanticateUser=async({req,res,userExist,user,name,email})=>{
  
  console.log(userExist?.id);
  
  const session = await createSession(userExist?.id || user.id,{
    ip:req.clientIp,
    userAgent:req.headers["user-agent"]
  })
// console.log("session",session.id);

  const AccessToken=createAccessToken({
    id:userExist?.id || user.id,
    name:userExist?.name || name ,
    email:userExist?.email || email,
    isEmailValid:false,
    sessionId:session.id
  })
   const refreshToken=createRefreshToken(session.id)
   const baseConfig={
    httpOnly:true,
    secure:true
   }
   res.cookie("access_token",AccessToken,{
    ...baseConfig,
    maxAge:15 * 60 * 1000 
   })
      res.cookie("refresh_token",refreshToken,{
    ...baseConfig,
    maxAge:7 * 24 * 60 * 60 * 1000 
   })
  }

  export const getAllShortLinks=async(userId)=>{
  const data = await db.select().from(shortLinksTable).where(eq(shortLinksTable.userId,userId))
  return data; 
}

export const generateRandomToken=(digit=8)=>{
 const min=10**(digit-1)
 const max=10**digit
return crypto.randomInt(min,max).toString()

}

export const insertVerifyEmailToken=async({userId,token})=>{

    return db.transaction(async(tx)=>{
   try {
    // delete expire token
     await tx.delete(verifyEmailTokensTable)
          .where(lt(verifyEmailTokensTable.expiresAt,sql`CURRENT_TIMESTAMP`))
    //delete existing token
    await tx.delete(verifyEmailTokensTable)
          .where(eq(verifyEmailTokensTable.userId,userId))
    // inter a new token
    await tx.insert(verifyEmailTokensTable)
          .values({userId,token})
  
  } catch (error) {
    console.log("Failed to insert verification token",error);
    throw new Error ("Unable to create a verification table")
  }
 })
}

export const  creatverifyEmailLink=async({email,token})=>{
//  const uriEncodedEmail=encodeURIComponent(email)
//  return `${process.env.FRONTEND_URL}/verify-email-token?token=${token}@email=${uriEncodedEmail}`

const url =new URL(`${process.env.FRONTEND_URL}verify-email-token`)
url.searchParams.append("token",token)
url.searchParams.append("email",email)
return url.toString();
}

export const findVerificationEmailToken=async({email,token})=>{
const data= await db.select({
  userId:verifyEmailTokensTable.userId,
  token:verifyEmailTokensTable.token,
  expiresAt:verifyEmailTokensTable.expiresAt
 }).from(verifyEmailTokensTable)
   .where(
    and(
    eq(verifyEmailTokensTable.token,token),
    gte(verifyEmailTokensTable.expiresAt,sql`CURRENT_TIMESTAMP`)
    )
  ).catch(error.message)
  // console.log(data.length);
  if(!data.length) return null
  const userId=data[0].userId
  const userData=await db.select({
    userId:usersTable.id,
    email:usersTable.email,
  }).from(usersTable)
    .where(eq(usersTable.id,userId))
  if (!userData.length){
    return null
  }
  return{
    userId:userData[0].userId,
    email:userData[0].email,
    token:data[0].token,
    expiresAt:data[0].expiresAt
  }
}

export const verifyUserEmailAndUpdate=async(email)=>{
 await db.update(usersTable)
         .set({isEmailValid:true})
         .where(eq(usersTable.email,email))
}