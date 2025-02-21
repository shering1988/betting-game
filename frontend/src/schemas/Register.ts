import {JSONSchemaType} from "ajv";
import RegisterRequest from "../types/request/RegisterRequest";

const RegisterSchema: JSONSchemaType<RegisterRequest> = {
    type: "object",
    properties: {
        name: {
            type: "string", minLength: 3, maxLength: 20,
            pattern: "^[a-zA-Z0-9_\\-\\.\\+#]*$",
            errorMessage: "Ungültiger Wert für den Nutzername verwendet. (min. 3, maximal 20 Zeichen, nur A-Z + Nummern und Sonderzeichen wie -.+#)",
        },
        secret: {
            type: "string",
            errorMessage: "Ungültiger Wert für den Schlüssel verwendet.",
        },
        password: {
            type: "string", pattern: "^(?=.*[A-Z])(?=.*[!@#$&*.-_?+=])(?=.*[0-9])(?=.*[a-z]).{8,}$",
            errorMessage: "Passwort entspricht nicht den Sicherheitsbestimmungen.",
        },
        passwordRepeat: {
            type: "string", pattern: "^(?=.*[A-Z])(?=.*[!@#$&*.-_?+=])(?=.*[0-9])(?=.*[a-z]).{8,}$",
            errorMessage: "Passwort entspricht nicht den Sicherheitsbestimmungen.",
        },
        email: {
            type: "string", pattern: "^.+@.+\\..+$",
            errorMessage: "Ungültige Email-Adresse verwendet.",
        },
        reminder: {
            type: "boolean",
            errorMessage: "Ungültiger Wert für Benachrichtigung verwendet.",
        },
    },
    errorMessage: {
        required: {
            name: "Nutzername fehlt.",
            reminder: "Einstellung für Benachrichtigung fehlt.",
            passwordRepeat: "Passwort-Wiederholung fehlt.",
            password: "Passwort fehlt.",
            email: "Email fehlt.",
            secret: "Schlüssel fehlt.",
        },
    },
    required: ["name", "reminder", "passwordRepeat", "password", "email", "secret"],
    additionalProperties: false
};

export default RegisterSchema;