import { Router } from "express";

import {
    getAllTests,
    CreateTest,
    UpadetTest,
    DeleteTest
} from "../controllers/TestController.js";

const router = Router();

/**
 * @GET
 * @desc // get all test
 * @access public
 */
router.get("/", getAllTests);

/**
 * @POST
 * @desc // create a new test
 * @access public
 */
router.post("/", CreateTest);

/**
 * @PATCH
 * @desc // update a test
 * @access public
 */
router.patch("/:id", UpadetTest);

/**
 * @DELETE
 * @desc //DELETE a test
 * @access public
 */
router.delete("/:id", DeleteTest);

export default router;
