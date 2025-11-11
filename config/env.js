import {z} from "zod"

const portShema=z.coerce.number().min(3000).max(6615).default(3001)
export const PORT =portShema.parse(process.env.PORT)

const envSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRATE: z.string().min(1),
  GITHUB_CLIENT_ID: z.string().min(1),
  GITHUB_CLIENT_SECTRATE: z.string().min(1),
  FRONTEND_URL: z.string().url().trim().min(1),
});

export const env = envSchema.parse(process.env);