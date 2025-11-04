


import {authModelgetUserByEmail
       ,authModelPostRegister
       ,authPostPassExist
       ,hashPassword
       ,createSession
       ,createAccessToken
       ,createRefreshToken
       ,clearUserSession
       ,authanticateUser
       ,findUserById
       ,getAllShortLinks
       ,generateRandomToken
      ,insertVerifyEmailToken
     , creatverifyEmailLink
    ,findVerificationEmailToken
  ,verifyUserEmailAndUpdate
 ,sendNewVerificattionEmailLink} from "../model/auth.model.js"
import {registerUserSchema,loginUserSchema,verifyEmailSchema} from "../validators/auth-validator.js"
import {sendEmail} from "../lib/nodemailer.js"
export const controllRegister= async (req,res) => {
  if(req.user) return res.redirect("/")
   return res.render("auth/register",{errors:req.flash("errors")})
}
export const controllLogin=async(req,res)=>{
  if(req.user) return res.redirect("/")
  return  res.render("auth/login",{errors:req.flash("errors")})
}

export const controllPostLogin=async(req,res)=>{
 const result=loginUserSchema.safeParse(req.body)
if (!result.success){
const error=JSON.parse(result.error.message)
const messages = error.map(err => err.message);
   req.flash("errors",messages)
   return res.redirect("/login")
}

let {email,password}=result.data
  const userExist= await authModelgetUserByEmail(email)
  // console.log("emailExist",emailExist);
  
  if(!userExist){ 
     req.flash("errors","Invalid user and password")
    return res.redirect("/login")}
  const passExist= await authPostPassExist({password,hash:userExist.password})
  // console.log(passExist);
  if(passExist)  {
    
     await authanticateUser({req,res,userExist})

   return res.redirect("/")
  }
  else {
    req.flash("errors","Invalid user and password")
    return res.redirect("/Login")}
  // res.setHeader("Set-Cookie","IsLoggedIn=true; path=/;")
 
  // return  res.redirect("/")
}

export const controllPostRegister=async(req,res)=>{
  // if (req.user) return res.redirect("/")
const result=registerUserSchema.safeParse(req.body)
if (!result.success){
const error=JSON.parse(result.error.message)
const messages = error.map(err => err.message);
   req.flash("errors",messages)
   return res.redirect("/register")
}

let {name,email,password}=result.data
  let userExist=await authModelgetUserByEmail(email)
  // console.log("userExist",userExist);
  
  if(userExist){
    req.flash("errors","User already exists")
    return res.redirect("/register")}
    const hashedPassword=await hashPassword(password)

    const user = await authModelPostRegister({name,email,password:hashedPassword})
   
    await authanticateUser({req,res,user,name,email})
    await sendNewVerificattionEmailLink({email,userId:user.id})
return  res.redirect("/")
}



export const getMe=async(req,res)=>{
  if(!req.user) {
    return res.redirect("/login")}
    return res.send(`<h1>hey ${req.user.name} and ${req.user.email} </h1>`)
}

export const logOutControll= async(req,res)=>{

  await clearUserSession(req.user.sessionId)
  res.clearCookie("access_token")
  res.clearCookie("refresh_token")
  return res.redirect("/login")
}



export const getProfilePage=async(req,res)=>{

try {
      const user=await findUserById(req.user.id)
    const userShortLinks= await getAllShortLinks(user.id)

  if (!user) return res.redirect("/login")
     return res.render("auth/profile",{
    user:{
      id:user.id,
      name:user.name,
      email:user.email,
      createdAt:user.createdAt,
      isEmailValid:user.isEmailValid,
      links:userShortLinks.length

    }})
} catch (error) {
    console.log("profile error");
}
   
}

export const getVerifyEmailPage=(req,res)=>{
  if(!req.user|| req.user.isEmailValid) return res.redirect("/")
  return res.render("auth/verify-email",{
user:{
  email:req.user.email,
}})
}

export const resendVerificarionLink=async(req,res)=>{
  if(!req.user|| req.user.isEmailValid) return res.redirect("/")  
   await sendNewVerificattionEmailLink({email:req.user.email,userId:req.user.id})
 return res.redirect("/verify-email")
 
}


 export const verifyEmailToken=async(req,res)=>{
  const {data,error}= verifyEmailSchema.safeParse(req.query)
 
  if(error){
    res.send("Verification link invalid or expired")
  }
  const Token= await findVerificationEmailToken(data)
  if(!Token) return res.send("Verification link invalid or expired")
    await verifyUserEmailAndUpdate(data.email)
  res.redirect("profile")
  
}