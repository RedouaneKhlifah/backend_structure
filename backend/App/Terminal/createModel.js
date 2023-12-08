// createModel.js

const fs = require("fs").promises;
const path = require("path");

let FeaturName = process.argv[2];

if (!FeaturName) {
    console.error("Please provide a model name.");
    process.exit(1);
}

FeaturName = FeaturName.charAt(0).toUpperCase() + FeaturName.slice(1);

const modelContent = `
import mongoose from "mongoose";

const ${FeaturName}Schema = mongoose.Schema({
    // test: {
    //     type: String,
    //     required: [true, 'please fill the test']
    // }
});

const ${FeaturName} = mongoose.model('${FeaturName.toLowerCase()}', ${FeaturName}Schema);

export default ${FeaturName};
`;
async function createFeature(name, folder, content) {
    const scriptDir = __dirname;

    const backendDir = path.resolve(scriptDir, "../..");

    const modelFileName = `${name}.js`;
    const modelsFolderPath = path.join(backendDir, folder);
    console.log("------------");
    console.log(modelsFolderPath);
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

createFeature(FeaturName, "models", modelContent);
module.exports = createFeature;
