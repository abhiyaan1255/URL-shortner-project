import {z} from "zod"

const portShema=z.coerce.number().min(3000).max(6615).default(3001)
export const PORT =portShema.parse(process.env.PORT)