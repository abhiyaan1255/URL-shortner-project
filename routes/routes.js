import { Router } from "express";
import { 
    getHtmlByController
    ,postcontroller,
    getRedirectController,
    getShortnerEditPage,
    postShortnerEditPage,
    postShortendDeletePage,
    
} from "../controller/controller.js";
const router =Router()

router.get("/",getHtmlByController)
router.post("/",postcontroller)

router.get("/:shortCode",getRedirectController)
router.route("/edit/:id")
 .get(getShortnerEditPage)
 .post(postShortnerEditPage)

router.route("/delete/:id")
  .post(postShortendDeletePage)


export default router