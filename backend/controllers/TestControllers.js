import asynchandler from "express-async-handler";
import Test from "../models/Test.js";
import { validator, testSchema, sanitizer } from "../validator/JoiSchemas.js";
import { CheckRecord } from "../services/helpers/CommonServices.js";

/**
 * Retrieves all test.
 * @route {GET} /test
 * @access public
 */
export const getAlltests = asynchandler(async (req, res) => {
    const tests = await Test.find();
    res.json(tests);
});

/**
 * CREATE new test.
 * @route {POST} /test
 * @access public
 */
export const Createtest = asynchandler(async (req, res) => {
    const SanitizedData = sanitizer(req.body);
    validator(testSchema, SanitizedData);
    const post = await Test.create(req.body);
    res.status(201).json(post);
});

/**
 * Update new test.
 * @route {PATCH} /test/id
 * @access public
 */
export const Upadettest = asynchandler(async (req, res) => {
    validator(testSchema, req.body);
    const { id } = req.params;
    const data = req.body;
    await CheckRecord(Test, id);
    const post = await Test.findByIdAndUpdate(id, data, { new: true });
    res.status(200).json(post);
});

/**
 * Update new test.
 * @route {DELETE} /test/id
 * @access public
 */

export const Deletetest = asynchandler(async (req, res) => {
    const { id } = req.params;
    await CheckRecord(Test, id);
    const post = await Test.findByIdAndDelete(id);
    res.status(200).json(post);
});
