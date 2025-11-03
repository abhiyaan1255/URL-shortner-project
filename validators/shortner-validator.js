import z from "zod"


export const shortnerSchema= z.object({
    url:z
    .string({requierd_error:"url is required"})
    .trim()
    .max(124,{message:"Url cannot be more than 124 "})
    .url({message:"Please enter a valid url"}),
    shortCode:z
    .string()
    .trim()
    .max(10,{message:"shortCode must me not more than 10"})
    .min(5,{message:"shortCode must be more than 5"})
})