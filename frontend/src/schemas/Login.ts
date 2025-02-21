import {JSONSchemaType} from "ajv";
import Credentials from "../types/Credentials";

const LoginSchema: JSONSchemaType<Credentials> = {
    type: "object",
    properties: {
        username: {
            type: "string",
            errorMessage: "Ungültiger Wert für den Nutzername verwendet."
        },
        password: {
            type: "string",
            errorMessage: "Ungültiger Wert für das Passwort verwendet."
        },
    },
    errorMessage: {
        required: {
            name: "Dein Nutzername fehlt.",
            password: "Du musst dein Password eingeben.",
        },
    },
    required: ["username", "password"],
    additionalProperties: false
};

export default LoginSchema;