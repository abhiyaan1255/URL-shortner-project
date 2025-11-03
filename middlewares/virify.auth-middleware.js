import { verifyJWTToke,refreshTokens } from "../model/auth.model.js";
// export const verifyAuthentication=(req,res,next)=>{
//     const token=req.cookies.access_token
//     // console.log("token",token);
    
//     if(!token){
//         req.user=null
//         // log("no token found in cookie")
//         return next()
//     }
//     try {
//         const decodedToken=verifyJWTToke(token)
//         req.user=decodedToken
//     //   console.log("decoded Token",req.user);
      
//     } catch (error) {
//         req.user=null
//         console.log("eror req user",req.user);
        
//     }
//  next()
// }

export const verifyAuthentication=async(req,res,next)=>{
    const accessToken=req.cookies.access_token
    const refreshToken=req.cookies.refresh_token
//    console.log("refresh",refreshToken);
   
    
    req.user=null
    if(!accessToken && !refreshToken){
        req.user=null
       return next()
    }
    if(accessToken){
        const decodedToken=verifyJWTToke({token:accessToken})
        // console.log("decoded",decodedToken);
        
        req.user=decodedToken
        // console.log(req.user);
        
        return next()
    }
    if(refreshToken){
        try {
         const {  newAccessToken,newRefreshToken,user}=await refreshTokens(refreshToken)
        //  console.log("user",user);
         req.user=user
        //  console.log(req.user);
         
            const baseConfig={
    httpOnly:true,
    secure:true
   }
   res.cookie("access_token",newAccessToken,{
    ...baseConfig,
    maxAge:15 * 60 * 1000 
   })
      res.cookie("refresh_token",newRefreshToken,{
    ...baseConfig,
    maxAge:7 * 24 * 60 * 60 * 1000 
   })

  return next()
        } catch (error) {
         console.log(error.message);
            
        }
    }
   return next()
}