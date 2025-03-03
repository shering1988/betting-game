import {JSONSchemaType} from "ajv";
import StageRequest from "../types/request/StageRequest";

const StageSchema: JSONSchemaType<StageRequest> = {
    type: "object",
    properties: {
        id: {
            type: "integer", nullable: true,
            errorMessage: {
                type: "Ungültige ID verwendet.",
            }
        },
        name: {
            type: "string", minLength: 3, maxLength: 100,
            pattern: "^[\\sa-zA-Z0-9_\\-\\.\\+#]*$",
            errorMessage: "Ungültiger Wert für den Namen verwendet. (min. 3, maximal 100 Zeichen, nur A-Z + Nummern und Sonderzeichen wie -.+#)",
        },
        isFinal: {
            type: "boolean",
            errorMessage: "Ungültiger Wert für Ist-KO-Runde verwendet.",
        },
        isGrandFinal: {
            type: "boolean",
            errorMessage: "Ungültiger Wert für Ist-Finale verwendet.",
        },
        tournament: {
            type: "integer",
            errorMessage: "Ungültige Turnier-ID verwendet.",
        },
    },
    errorMessage: {
        required: {
            tournament: "Turnier-ID fehlt.",
            name: "Name fehlt.",
            isFinal: "Einstellung für Ist-KO-Phase fehlt.",
            isGrandFinal: "Einstellung für Ist-Finale fehlt.",
        },
    },
    required: ["name", "isFinal", "isGrandFinal", "tournament"],
    additionalProperties: false
};

export default StageSchema;