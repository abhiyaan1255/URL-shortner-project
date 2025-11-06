// import { timestamp } from 'drizzle-orm/gel-core';
import {  relations, sql } from 'drizzle-orm';
// import { text } from 'drizzle-orm/gel-core';
import { text ,boolean,int, mysqlTable, serial, varchar,timestamp } from 'drizzle-orm/mysql-core';
// import { boolean } from 'zod';

export const shortLinksTable = mysqlTable('short_link', {
  id: int().autoincrement().primaryKey(),
  url: varchar({ length: 255 }).notNull().unique(),
  shortCode: varchar({length:20}).notNull().unique(),
  createdAt:timestamp("created_at").notNull().defaultNow(),
 updatedAt:timestamp("updated_at").defaultNow().notNull(),
  userId:int("user_id").notNull().references(()=>usersTable.id)
});

export const sessionsTable=mysqlTable("sessions",{
  id:int().autoincrement().primaryKey(),
  userId:int("user_id").notNull().references(()=>usersTable.id,{onDelete:"cascade"}),
  vaild:boolean().default(true).notNull(),
  userAgent:text("user_agent"),
  ip:varchar({length:255}),
  createdAt:timestamp("created_at").notNull().defaultNow(),
 updatedAt:timestamp("updated_at").defaultNow().notNull()
})

export const verifyEmailTokensTable=mysqlTable("is_email_valid",{
  id:int()
    .autoincrement()
    .notNull()
    .primaryKey(),
  userId:
    int("user_id")
    .notNull()
    .references(()=>usersTable.id,{onDelete:"cascade"}),
  token:varchar({length:8})
       .notNull(),
  expiresAt:timestamp("expires_at")
       .default(sql`(CURRENT_TIMESTAMP + INTERVAL 1 DAY)`)
       .notNull(),
  createdAt:timestamp("created_at").notNull().defaultNow(),
})

export const passwordResetTokensTable=mysqlTable("password_reset_tokens",{
  id:int().autoincrement().primaryKey(),
  userId:int("user_id")
   .notNull()
   .references(()=>usersTable.id,{onDelete:"cascade"})
   .unique(),
  tokenHash:text("token_hash").notNull(),
  expiresAt:timestamp("expires_at")
       .default(sql`(CURRENT_TIMESTAMP + INTERVAL 1 HOUR)`)
       .notNull(),
  createdAt:timestamp("created_at").notNull().defaultNow()
})
export const usersTable = mysqlTable('users', {
  id: int().autoincrement().primaryKey(),
 name :varchar({length:255}).notNull(),
 email:varchar({length:255}).notNull().unique(),
 isEmailValid:boolean("is_email_valid").default(false).notNull(), 
 password:varchar({length:255}).notNull(),
 createdAt:timestamp("created_at").notNull().defaultNow(),
 updatedAt:timestamp("updated_at").defaultNow().notNull()
});

export const userRelation=relations(usersTable,({many})=>({
  shortLink:many(shortLinksTable),
  session:many(sessionsTable)
}))
export const shortlinksRelation=relations(shortLinksTable,({one})=>({
  user:one(usersTable,{
    fields:[shortLinksTable.userId],  //foregian key
    references:[usersTable.id]
  })
}))

export const sessionsRelation=relations(sessionsTable,(({one})=>({
user:one(usersTable,{
  fields:[sessionsTable.userId],
  references:[usersTable.id]
})
})))