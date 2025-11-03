import { Router } from "express";

import {controllRegister,
  controllLogin,
  controllPostLogin,
  controllPostRegister,
  getMe,
  logOutControll,
  getProfilePage,
getVerifyEmailPage,
resendVerificarionLink,
 verifyEmailToken} from "../controller/auth.controller.js"
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
route.route("/verify-email-token").get(verifyEmailToken)

export const authRoute=route