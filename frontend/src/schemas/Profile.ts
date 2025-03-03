import {JSONSchemaType} from "ajv";
import UserRequest from "../types/request/UserRequest";

const ProfileSchema: JSONSchemaType<UserRequest> = {
    type: "object",
    properties: {
        name: {
            type: "string",
            minLength: 3,
            maxLength: 20,
            pattern: "^[a-zA-Z0-9_\\-\\.\\+#]*$",
            errorMessage: "Ungültiger Wert für den Nutzername verwendet. (min. 3, maximal 20 Zeichen, nur A-Z + Nummern und Sonderzeichen wie -.+#)",
        },
        password: {
            type: "string", nullable: true, pattern: "^(?=.*[A-Z])(?=.*[!@#$&*.-_?+=])(?=.*[0-9])(?=.*[a-z]).{8,}$",
            errorMessage: "Passwort entspricht nicht den Sicherheitsbestimmungen.",
        },
        passwordRepeat: {
            type: "string", nullable: true, pattern: "^(?=.*[A-Z])(?=.*[!@#$&*.-_?+=])(?=.*[0-9])(?=.*[a-z]).{8,}$",
            errorMessage: "Passwort entspricht nicht den Sicherheitsbestimmungen.",
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
        },
    },
    required: ["name", "reminder"],
    additionalProperties: false
};

export default ProfileSchema;