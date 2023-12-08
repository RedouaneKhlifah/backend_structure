/* eslint-disable no-eval */
const fs = require("fs").promises;
const path = require("path");
const { constants } = require("fs");

// const createFeature = require("./CreateFeature");

let FeaturName = process.argv[2];

if (!FeaturName) {
    console.error("Please provide a model name.");
    process.exit(1);
}

FeaturName = FeaturName.charAt(0).toUpperCase() + FeaturName.slice(1);

const FeaturNameLowercase = FeaturName.toLowerCase();

// Read the content of the file synchronously

async function GetSheama() {
    const scriptDir = __dirname;

    const backendDir = path.resolve(scriptDir, "../..");

    const modelFileName = `${FeaturName}.js`;
    const modelsFolderPath = path.join(backendDir, "models");
    const filePath = path.join(modelsFolderPath, modelFileName);
    try {
        const fileContent = await fs.readFile(filePath, "utf-8");
        // Extract the part of the content that defines the schema
        const schemaDefinition = fileContent.match(
            /mongoose.Schema\(({[\s\S]+?})\);/
        );
        const schemaObject = eval(`(${schemaDefinition[1]})`);
        return schemaObject;
    } catch (error) {
        console.error("Failed to read the file:", error);
    }
}

async function ShemaObjectGenerator() {
    const modelSheama = await GetSheama();
    let SheamaAtrebute = "";

    Object.keys(modelSheama).map((key) => {
        SheamaAtrebute = SheamaAtrebute + `${key}: Joi`;
        if (Object.keys(modelSheama[key]).length > 0) {
            Object.keys(modelSheama[key]).forEach((nestedKey) => {
                if (nestedKey === "type") {
                    if (
                        String(modelSheama[key][nestedKey])
                            .toLowerCase()
                            .includes("string")
                    ) {
                        return (SheamaAtrebute += ".string()");
                    } else if (
                        String(modelSheama[key][nestedKey])
                            .toLowerCase()
                            .includes("number")
                    ) {
                        return (SheamaAtrebute += ".number()");
                    }
                } else if (nestedKey === "required") {
                    if (
                        String(modelSheama[key][nestedKey])
                            .toLowerCase()
                            .includes("true")
                    ) {
                        SheamaAtrebute += ".required()";
                    }
                }
                SheamaAtrebute = SheamaAtrebute + ",";
            });
        }
    });
    return SheamaAtrebute;
}

async function JoiShemaCreator() {
    const schema = await ShemaObjectGenerator();

    const JoiSheamaContent = `
    /**
    * @${FeaturName}
    */
    export const ${FeaturName}Schema = Joi.object({
        ${schema}
    }).messages(customErrorMessages);`;

    return JoiSheamaContent;
}
// content
const ControllerContent = `
import asynchandler from "express-async-handler";
import ${FeaturName} from "../models/${FeaturName}.js";
import { validator, ${FeaturNameLowercase}Schema, sanitizer } from "../validator/JoiSchemas.js";
import { CheckRecord } from "../services/helpers/CommonServices.js";

/**
 * Retrieves all ${FeaturNameLowercase}.
 * @route {GET} /${FeaturNameLowercase}
 * @access public
 */
export const getAll${FeaturNameLowercase}s = asynchandler(async (req, res) => {
    const ${FeaturNameLowercase}s = await ${FeaturName}.find();
    res.json(${FeaturNameLowercase}s);
});

/**
 * CREATE new ${FeaturNameLowercase}.
 * @route {POST} /${FeaturNameLowercase}
 * @access public
 */
export const Create${FeaturNameLowercase} = asynchandler(async (req, res) => {
    const SanitizedData = sanitizer(req.body);
    validator(${FeaturNameLowercase}Schema, SanitizedData);
    const post = await ${FeaturName}.create(req.body);
    res.status(201).json(post);
});

/**
 * Update new ${FeaturNameLowercase}.
 * @route {PATCH} /${FeaturNameLowercase}/id
 * @access public
 */
export const Upadet${FeaturNameLowercase} = asynchandler(async (req, res) => {
    validator(${FeaturNameLowercase}Schema, req.body);
    const { id } = req.params;
    const data = req.body;
    await CheckRecord(${FeaturName}, id);
    const post = await ${FeaturName}.findByIdAndUpdate(id, data, { new: true });
    res.status(200).json(post);
});

/**
 * Update new ${FeaturNameLowercase}.
 * @route {DELETE} /${FeaturNameLowercase}/id
 * @access public
 */

export const Delete${FeaturNameLowercase} = asynchandler(async (req, res) => {
    const { id } = req.params;
    await CheckRecord(${FeaturName}, id);
    const post = await ${FeaturName}.findByIdAndDelete(id);
    res.status(200).json(post);
});

`;

const RoutesContent = `
import { Router } from "express";

import {
    getAll${FeaturName}s,
    Create${FeaturName},
    Upadet${FeaturName},
    Delete${FeaturName},
} from "../controllers/${FeaturName}Controller.js";

const router = Router();

/**
 * @GET
 * @desc // get all ${FeaturNameLowercase}
 * @access public
 */
router.get("/", getAll${FeaturName}s);

/**
 * @POST
 * @desc // create a new ${FeaturNameLowercase}
 * @access public
 */
router.post("/", Create${FeaturName});

/**
 * @PATCH
 * @desc // update a ${FeaturNameLowercase}
 * @access public
 */
router.patch("/:id", Upadet${FeaturName});

/**
 * @DELETE
 * @desc //DELETE a ${FeaturNameLowercase}
 * @access public
 */
router.delete("/:id", Delete${FeaturName});

export default router;


`;

const indexRoutesContentImports = `
import ${FeaturName}Routes from "../routes/${FeaturName}Routes.js";
`;

const indexRoutesContent = `
router.use("/${FeaturName}", ${FeaturName}Routes);
`;

async function appendToFile(name, folder, content, position) {
    const scriptDir = __dirname;

    const backendDir = path.resolve(scriptDir, "../..");

    const modelFileName = `${name}.js`;
    const modelsFolderPath = path.join(backendDir, folder);
    const filePath = path.join(modelsFolderPath, modelFileName);

    // Check if 'models' folder exists; create one if it doesn't
    try {
        await fs.mkdir(modelsFolderPath, { recursive: true });
        console.log(`${name} folder created at ${modelsFolderPath}`);
    } catch (error) {
        // Ignore error if the folder already exists
        if (error.code !== "EEXIST") {
            console.error("Failed to create directory:", error);
            throw error;
        }
    }

    // Check if the file already exists
    try {
        await fs.access(filePath, constants.F_OK);
        if (position === "top") {
            // Read the existing content of the file
            const existingContent = await fs.readFile(filePath, "utf-8");
            // Write the existing content along with the new content
            await fs.writeFile(filePath, content + existingContent);

            console.log(`Text added to '${name}' at ${filePath}`);
        } else {
            // Append the new content to the existing file
            await fs.appendFile(filePath, content);
            console.log(`Text added to '${name}' at ${filePath}`);
        }
    } catch (error) {
        // File doesn't exist, throw an error
        console.error(`Model '${name}' does not exist at ${filePath}`);
        throw new Error(`Model '${name}' does not exist at ${filePath}`);
    }
}

async function createFeature(name, folder, content) {
    const scriptDir = __dirname;

    const backendDir = path.resolve(scriptDir, "../..");

    const modelFileName = `${name}.js`;
    const modelsFolderPath = path.join(backendDir, folder);

    const filePath = path.join(modelsFolderPath, modelFileName);

    // Check if 'models' folder exists; create one if it doesn't
    try {
        await fs.mkdir(modelsFolderPath, { recursive: true });
        console.log(`${name} folder created at ${modelsFolderPath}`);
    } catch (error) {
        // Ignore error if the folder already exists
        if (error.code !== "EEXIST") {
            console.error("Failed to create directory:", error);
            throw error;
        }
    }

    // Check if the file already exists
    try {
        console.log("------------");
        console.log(filePath);
        await fs.access(filePath);
        console.error(`Model '${name}' already exists at ${filePath}`);
        process.exit(1);
    } catch (error) {
        // File doesn't exist, proceed to create it
    }

    // Write the model content to the specified file
    try {
        await fs.writeFile(filePath, content);
        console.log(`Model '${name}' created successfully at ${filePath}`);
    } catch (error) {
        console.error("Failed to write file:", error);
        throw error;
    }
}

async function steup() {
    const JoiShema = await JoiShemaCreator();
    await appendToFile("JoiSchemas", "validator", JoiShema);
    await createFeature(
        FeaturName + "Controllers",
        "Controllers",
        ControllerContent
    );

    await createFeature(FeaturName + "Routes", "routes", RoutesContent);
    await appendToFile("index", "routes", indexRoutesContentImports, "top");

    await appendToFile("index", "routes", indexRoutesContent, "beforLast");
}

steup();

module.exports = createFeature;
