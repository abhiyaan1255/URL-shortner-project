import { Router } from "express";
import multer from "multer";
import path from "path"
import {controllRegister,
  controllLogin,
  controllPostLogin,
  controllPostRegister,
  getMe,
  logOutControll,
  getProfilePage,
getVerifyEmailPage,
resendVerificarionLink,
 verifyEmailToken,
getEditProfileName,
postEditProfile,
getEditPassword,
postEditPassword,
getresetPasswordPage,
postResetPassword,
getResetTokenPage,
postResetPasswordPage,
getGooleLoginPage,
getGooleCallbackPage,
postGoogleCallbackPage,
getGithubLoginPage,
getGithubCallbackPage,
postGithubCallbackPage
} from "../controller/auth.controller.js"
import { error } from "console";
const route=Router()

// route.get("/register",controllRegister)
// route.get("/login",controllLogin)
route.route("/register")
  .get(controllRegister)
  .post(controllPostRegister)
route.route("/login")
   .get(controllLogin)
   .post(controllPostLogin)

route.route("/about").get(getMe)
route.route("/logout").get(logOutControll)
route.get("/profile",getProfilePage)
route.route("/verify-email").get(getVerifyEmailPage)
route.route("/resend-verification-link")
    .post(resendVerificarionLink)
route.route("/verify-email-token")
   .get(verifyEmailToken)

const avtarStorage=multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,"public/uploads/avatar");
  },
  filename:(req,file,cb)=>{
    const ext=path.extname(file.originalname);
    cb(null,`${Date.now()}_${Math.random()}${ext}`);
  }
})

const avtarFilter=(req,file,cb)=>{
  if(file.mimetype.startsWith("image/")){
    cb(null,true);
  }else{
    cb(new Error("only image files are allowed"),false)
  }
}
const avtarUpload = multer({
  storage: avtarStorage,
  fileFilter: avtarFilter,
  limits:{fileSize:5*1024*1024}
});
route.route("/edit-profile")
  .get(getEditProfileName)
  .post(avtarUpload.single("avatar"),postEditProfile)
  // .post(postEditProfile)

  route.route("/edit-password")
  .get(getEditPassword)
  .post(postEditPassword)

  route.route("/reset-password")
    .get(getresetPasswordPage)
    .post(postResetPassword)

  route.route("/reset-password/:token")
       .get(getResetTokenPage)
       .post(postResetPasswordPage)
      
  route.route("/google").get(getGooleLoginPage)
  route.route("/google/callback")
  .get(getGooleCallbackPage)
  .post(postGoogleCallbackPage)

  route.route("/github")
  .get(getGithubLoginPage)

 route.route("/github/callback")
 .get(getGithubCallbackPage)
 .post(postGithubCallbackPage)
export const authRoute=route