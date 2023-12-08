import Joi from "joi";

/**
 * @HELPER
 * @type function
 * @params req.body :  object
 * @desc function that take object req.body and sanitize it
 * @returns object include sanitized data from the req.body
 **/
export const sanitizer = (data) => {
    if (typeof data !== "object" || Object.keys(data).length === 0) {
        throw new Error("Please provide a non-empty object for sanitization.");
    }
    const SanitizedData = {};
    Object.keys(data).forEach((key) => {
        SanitizedData[key] = data[key].customTrim();
    });
    return SanitizedData;
};

/**
 * @HELPER
 * @type function
 * @params schema
 * @params req.body object
 * @desc function validate sheama either return message or null , takes two parameter schema and req.body object
 **/
export const validator = (schema, data) => {
    const { error } = schema.validate(data);
    if (error) {
        const errors = error.details.map((detail) => detail.message);
        throw new Error(errors);
    }
};

/**
 * @desc schema that defines custom Error Messages
 **/
const customErrorMessages = {
    "string.base": "The {#label} field must be a valid string,{#label}",
    "string.pattern.base": "Password cannot conStain spaces,{#label}",
    "string.min":
        "The {#label} field must be at least {#limit} characters long,{#label}",
    "string.max":
        "The {#label} field must not exceed {#limit} characters.,{#label}",
    "string.email": "The email address is not valid.,{#label}",
    "any.required": "The {#label} field is required.,{#label}",
    "string.empty": "the {#label} Field cannot be empty,{#label}",
    "number.base": "The {#label} field must be a valid id.,{#label}"
};

/**
 * @Test
 */
export const TestSchema = Joi.object({
    test: Joi.string().required(),
    test1: Joi.number().required()
}).messages(customErrorMessages);
