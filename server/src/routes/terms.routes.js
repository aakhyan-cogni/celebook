import { Router } from "express";
import * as TermsController from "../controllers/terms.controller.js";

export const termsRouter = Router();

termsRouter.get("/", TermsController.getPublicTerms);
