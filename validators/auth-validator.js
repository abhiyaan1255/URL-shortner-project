import z, { email } from "zod";
export const loginUserSchema=z.object({
    email:z.string()
    .email({message:"Please enter valid email"})
    .trim()
    .max(40,{message:"Email must be not more thane 40 characters"}),
    password:z.string()
    .min(6,{message:"Password must be 6 charaters long"})
    .max(20,{message:"Password must be not more thane 20 characters"})
    })

export const registerUserSchema=loginUserSchema.extend({
    name:z.string()
    .trim()
    .min(5,{message:"Name must be 5 charaters long"})
    .max(20,{message:"Name must be not more thane 20 characters"}),
    email:z.string()
    .email({message:"Please enter valid email"})
    .trim()
    .max(40,{message:"Email must be not more thane 40 characters"}),
    password:z.string()
    .min(6,{message:"Password must be 6 charaters long"})
    .max(20,{message:"Password must be not more thane 20 characters"})
    })

export const verifyEmailAndTokenSchema=z.object({
    token:z.string().trim().length(8),
    email:z.string().trim().email()
})

export const userSchema=z.object({
    name:z.string({message:"Name must be string"})
    .trim()
    .min(5,{message:"Name must be 5 charaters long"})
    .max(20,{message:"Name must be not more thane 20 characters"})
    .regex(/^[A-Za-z\s]+$/, { message: "Name can only contain letters and spaces" })
})

export const verifyPasswordSchema=z.object({
    oldPassword:z.string().
      min(1,{message:"current password is required"}),

    newPassword:z.string()
        .min(6,{message:"Password must be 6 charaters long"})
    .max(20,{message:"Password must be not more thane 20 characters"}),

    confirmPassword:z.string()
         .min(6,{message:"Password must be 6 charaters long"})
    .max(20,{message:"Password must be not more thane 20 characters"}),
    }).refine((data)=>data.newPassword==data.confirmPassword,{
        message:"password dont match",
        path:["confirmPassword"]
    })
export const verifyEmailSchema=z.object({
    email:z.string().trim().email()
})

export const verifyForgetPasswordSchema=z.object({
   newPassword:z.string()
        .min(6,{message:"Password must be 6 charaters long"})
    .max(20,{message:"Password must be not more thane 20 characters"}),

    confirmPassword:z.string()
         .min(6,{message:"Password must be 6 charaters long"}) 
}).refine((data)=>data.newPassword==data.confirmPassword,{
        message:"password dont match",
        path:["confirmPassword"]
    })