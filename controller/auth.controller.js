


import { h1 } from "framer-motion/client"
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
 ,sendNewVerificattionEmailLink
,editProfileNameById
,editPassById
,findUserByEmail
,createResendPasswordLink
,findResendPasswordToken
,clearForgetPasswordToken} from "../model/auth.model.js"
import {registerUserSchema,loginUserSchema,verifyEmailAndTokenSchema,userSchema
    ,verifyPasswordSchema,verifyEmailSchema,verifyForgetPasswordSchema} from "../validators/auth-validator.js"
import crypto from "crypto"
import { getHtmlFromMjmlTemplate } from "../lib/get-html-from-mjml-template.js"
import {sendEmail} from "../lib/send-email.js"
import { error } from "console"
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
  // console.log("emailExist",userExist);
  
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
  const {data,error}= verifyEmailAndTokenSchema.safeParse(req.query)
 
  if(error){
    res.send("Verification link invalid or expired")
  }
  const Token= await findVerificationEmailToken(data)
  if(!Token) return res.send("Verification link invalid or expired")
    await verifyUserEmailAndUpdate(data.email)
  res.redirect("profile")
  
}

// edit function
export const getEditProfileName=async(req,res)=>{
if(!req.user) return res.redirect("/login")
const user=await findUserById(req.user.id)
  res.render("auth/edit-profile",{
    name:user.name,
    errors:req.flash("errors")
  })
}

export const postEditProfile=async(req,res)=>{
  if(!req.user) res.redirect("/")
    const newName=req.body
  const{data,error} =  userSchema.safeParse(newName)
  if(error){
   const errors=JSON.parse(error.message)
   const messages = errors.map(err => err.message);
   req.flash("errors",messages)
   res.redirect("/edit-profile")
   return
  }
   await editProfileNameById({newName,id:req.user.id})
 return res.redirect("profile")
}

export const getEditPassword= (req,res)=>{
  if(!req.user) return res.redirect("/")
   res.render("auth/edit-password",{
  errors:req.flash("errors")})
  }

export const postEditPassword=async(req,res)=>{
  if (!req.user) return res.redirect("/")
  const {data,error}= verifyPasswordSchema.safeParse(req.body)
  if(error){
   const errors=JSON.parse(error.message)
   const messages = errors.map(err => err.message);
   req.flash("errors",messages)
   return res.redirect("edit-password")
  }
 const hashedPassword = await hashPassword(data.oldPassword)
 const user= await findUserById(req.user.id)
  if (!user) {
   req.flash("errors","old password is incorrect")
  return res.redirect("edit-password")}

 const passExist= await authPostPassExist({password:data.oldPassword,hash: hashedPassword})
 if (!passExist) {
   req.flash("errors","old password is incorrect")
  return res.redirect("edit-password")}
  const newhashPassWord=await hashPassword(data.newPassword)
  await editPassById({userId:user.id,password:newhashPassWord})
 return res.redirect("/profile")
}

export const getresetPasswordPage=(req,res)=>{
 res.render("auth/reset-password",{
  errors:req.flash("errors"),
  formsubmitted:req.flash("formsubmitted")
 })
}

export const postResetPassword=async(req,res)=>{
  const {data,error}= verifyEmailSchema.safeParse(req.body)
  if(error){
    const errors=JSON.parse(error.message)
   const messages = errors.map(err => err.message);
   req.flash("errors",messages)
   return res.redirect("reset-password")
  }
 const user = await findUserByEmail(data.email);

 if(user){
 const resendLink= await createResendPasswordLink(user.id)
 console.log(resendLink);
 
const html= await getHtmlFromMjmlTemplate("reset-password-email",{
  name:user.name,
  link:resendLink
})
 sendEmail({
  to:user.email,
  subject:"Reset Your Password",
  html,
 })
 req.flash("formsubmitted","true")
 return res.redirect("reset-password")
 }else{
  req.flash("formsubmitted","false")
 return res.redirect("reset-password")
}
}

export const getResetTokenPage=async(req,res)=>{
 const reqToken = req.params.token.trim();
 const token = decodeURIComponent(reqToken);
  
  
  const passwordResendData=await findResendPasswordToken(token)
  // console.log(passwordResendData);
  
  if(!passwordResendData){
 return res.send(`<p>your link is expired</p>`)}
 return res.render("auth/forget-password",{
  formsubmitted:req.flash("formsubmitted"),
  errors:req.flash("errors"),
  token,
 })
}

export const postResetPasswordPage=async(req,res)=>{
   const token=req.params.token 
  //  console.log("post",token);
     
  const passwordResendData=await findResendPasswordToken(token)
  // console.log("hello",passwordResendData);
  
 if(!passwordResendData){ 
  req.flash("errors","Password token is not matching")
  return res.redirect("/")}
const {data,error} = verifyForgetPasswordSchema.safeParse(req.body)
  if(error){
    const errors=JSON.parse(error.message)
   const messages = errors.map(err => err.message);
   req.flash("errors",messages)
   res.redirect(`/reset-password/${token}`)
  }
  const {newPassword}=data
 const user=await findUserById(passwordResendData.userId)
 if(!user){
   req.flash("errors","user not found")
  res.redirect(`/reset-password/${token}`)
 }
   await clearForgetPasswordToken(user.id)
  const hashedPassword= await hashPassword(newPassword)
  await editPassById({userId:user.id,password:hashedPassword})
  console.log("password reset succesfuly");
  res.redirect("/login")
}