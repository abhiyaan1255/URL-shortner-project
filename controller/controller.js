import { findUserById } from "../model/auth.model.js";
import { 
    loadLink,saveLink,
    getShortCodeExist,
    getUrlExist,
    findShortLinkById,
    UpdateShortendById
    ,deleteShortendById
 } from "../model/model.js";
import {shortnerSchema} from "../validators/shortner-validator.js"
import z from "zod"
export const getHtmlByController= async(req,res)=>{
    try {
    if(!req.user) return res.redirect("/login")  
    const links= await loadLink(req.user.id)
      return res.render("index",{link:links,host:req.host,errors:req.flash("errors")})  
    } catch (error) {
        console.log(error);
       return  res.status(404).send("19 controller page not found")
    }
 
}

// method 1
// export const postcontroller= async(req,res)=>{
//     try {
//         let {shortCode,url}=req.body
//         const link= await loadLink()
//         const shortCodeExist=link.some((item)=>item.shortCode==shortCode)  
//         const  urlExist=link.some((item)=>item.url==url)
//         if (shortCodeExist){
//             res.send("shortCode exist")
//         }else if(urlExist){
//             res.send("url exist")
//         }else{
//        await saveLink(url,shortCode)
//        res.redirect("/")
//         }
//     } catch (error) {
//        console.log(error);
//         res.status(404).send("post mistake")
//     }
// }

export const postcontroller= async(req,res)=>{
    try {
        let {shortCode,url}=req.body
        // const link= await loadLink()
        const shortCodeExist= await getShortCodeExist({shortCode,userId:req.user.id})  
        const  urlExist=await getUrlExist({url,userId:req.user.id})
        // console.log("hello",shortCodeExist,urlExist);
        
        if (shortCodeExist){
            req.flash("errors","shortCode already exists please try another")
            return res.redirect("/")
        }else if(urlExist){
            req.flash("errors","url already exists please try another")
           return res.redirect("/")
        }else{
            const result=shortnerSchema.safeParse({url,shortCode})
            if (!result.success) {
                const message=JSON.parse(result.error.message)
                // console.log(message);
                const error=message.map((e)=>e.message)
                console.log(error);
                req.flash("errors",error)
               return res.redirect("/")
            }
       await saveLink({url,shortCode,userId:req.user.id})
       res.redirect("/")
        }
    } catch (error) {
       console.log(error);
        res.status(404).send("78 controller post mistake")
    }
}

export async function getRedirectController(req,res) {
    try {
        const {shortCode}=req.params
        const link=await getShortCodeExist({shortCode,userId:req.user.id})
       
       if(link){
       return res.redirect(link.url)}
       else{
        // console.log("shortCode not found");
        return
       }
    } catch (error) {
        console.log(error.message);
        res.send("90 controller 404 your page not found")
    }
}

export const getShortnerEditPage=async(req,res)=>{
    if(!req.user) return res.redirect("/login")
    // const id =req.params
        const {data:id,error}=z.coerce.number().int().safeParse(req.params.id)
        if(error) return res.send("<h1>98 controller 404</h1>")
        
    try {
        const shortLink= await findShortLinkById(id)
        if(!shortLink) return res.send("<h1>102 controller 404</h1>")
        // console.log("shortlink",shortLink);
        // res.send(shortLink)
      return  res.render("edit-shortlink",{
            id:shortLink.id,
            url:shortLink.url,
            shortCode:shortLink.shortCode,
            errors:req.flash("errors")})
    } catch (error) {
        console.error(error);
        return res.status(500).send("112 controller Internal server error")
    }

}

export const postShortnerEditPage=async(req,res)=>{
     if(!req.user) return res.redirect("/login")
    // const id =req.params
        const {data:id,error}=z.coerce.number().int().safeParse(req.params.id)
        if(error) return res.send("<h1> 121 controller 404</h1>")
        const {url,shortCode}=req.body
    try {
        const newUpdateShortLink= await UpdateShortendById({id,url,shortCode})
        if(!newUpdateShortLink) return res.send("<h1> controller 404</h1>")
       return res.redirect("/")
    } catch (error) {
        console.error(error);
       return res.status(500).send("Internal server error")
    }

}


export const postShortendDeletePage=async(req,res)=>{

try {
     if(!req.user) return res.redirect("/login")
    const {data:id,error}=z.coerce.number().int().safeParse(req.params.id)
        if(error) return res.send("<h1>140 controller 404</h1>")
    await deleteShortendById(id)
  return res.redirect("/")
} catch (error) {
    console.error(error);
       return res.status(500).send(" 145 controller.js Internal server error")
}
 
}

