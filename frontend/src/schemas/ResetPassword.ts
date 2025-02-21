import {JSONSchemaType} from "ajv";

const ResetPasswordSchema: JSONSchemaType<{password: string, passwordRepeat: string}> = {
    type: "object",
    properties: {
        password: {
            type: "string", pattern: "^(?=.*[A-Z])(?=.*[!@#$&*.-_?+=])(?=.*[0-9])(?=.*[a-z]).{8,}$",
            errorMessage: "Passwort entspricht nicht den Sicherheitsbestimmungen.",
        },
        passwordRepeat: {
            type: "string", pattern: "^(?=.*[A-Z])(?=.*[!@#$&*.-_?+=])(?=.*[0-9])(?=.*[a-z]).{8,}$",
            errorMessage: "Passwort entspricht nicht den Sicherheitsbestimmungen.",
        },
    },
    errorMessage: {
        required: {
            passwordRepeat: "Passwort-Wiederholung fehlt.",
            password: "Passwort fehlt.",
        },
    },
    required: ["password", "passwordRepeat"],
    additionalProperties: false
};

export default ResetPasswordSchema;