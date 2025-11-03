import {db} from "../config/db.js"
import {usersTable, shortLinksTable} from "../drizzle/schema.js"
import { and, eq } from "drizzle-orm";
export async function loadLink(userId) {
    try {
       return await db.
       select().
       from(shortLinksTable).where(eq(
       shortLinksTable.userId,userId
       ))   
    } catch (error) {
        console.log(error);
        
    }
 
}
export async function getShortCodeExist({shortCode,userId}) {
    try {
         const [data] =await db
         .select()
         .from(shortLinksTable)
         .where(
            and(
     eq(shortLinksTable.shortCode,shortCode),
    eq(shortLinksTable.userId,userId)))
    return data
    } catch (error) {
       console.log(error);
        
    }
 
}

export async function getUrlExist({url,userId}) {
    try {
          const [data]=await db.select().from(shortLinksTable).where(
            and(
                eq(shortLinksTable.url,url),
                eq(shortLinksTable.userId,userId)) 
    )
    return data
    } catch (error) {
      console.log(error);
         
    }
  
}
export async function saveLink({url,shortCode,userId}) {
    try {
      return await db.insert(shortLinksTable).values({url:url,shortCode:shortCode,userId})   
    } catch (error) {
        console.log(error);
        
    }
   
}

export const findShortLinkById=async(id)=>{
    const [result]=await db
    .select()
    .from(shortLinksTable)
    .where(eq(shortLinksTable.id,id))
    return result
}

export const UpdateShortendById=async({id,url,shortCode})=>{
 return await db.update(shortLinksTable).set({url,shortCode}).where(eq(shortLinksTable.id,id))
}
export const deleteShortendById= async(id)=>{
    return await db.delete(shortLinksTable).where(eq(shortLinksTable.id,id))
}