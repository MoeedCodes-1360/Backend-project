import { Router } from "express";
import { healthUpdate } from "../controllers/healhcheck.controller";
import { verifyJWT } from "../middlewares/auth.middleware";

const router=Router()
router.use(verifyJWT)
router.route("/healthStatus").get(healthUpdate)
export default router