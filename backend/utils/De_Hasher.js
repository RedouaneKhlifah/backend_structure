import asynchandler from "express-async-handler";
import bcrypt from "bcrypt";

/**
 * hashing Data
 * @async
 * @param {string} Data
 * @returns {hashedData} Data hashed
 */

const hasher = asynchandler(async (data) => {
    const salt = await bcrypt.genSalt(10);
    const hashedData = await bcrypt.hash(data, salt);
    return hashedData;
});

/**
 *  trow error if Data not matched
 * @async
 * @param {string} Data
 * @param {string} hashedData hashed data
 * @returns {Promise<void>} A Promise that resolves if the  data matched
 */

const Dehasher = (data, hashedData) => {
    const match = bcrypt.compare(data, hashedData);
    if (!match) {
        throw new Error("password  not matched");
    }
};

export { hasher, Dehasher };
