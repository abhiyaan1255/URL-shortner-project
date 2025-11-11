import { Google } from "arctic";
import {env} from "../../config/env.js"

export const google =new Google(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRATE,
    "http://localhost:3000/google/callback"
)