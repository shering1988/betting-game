import {JSONSchemaType} from "ajv";
import TeamRequest from "../types/request/TeamRequest";

const TeamSchema: JSONSchemaType<TeamRequest> = {
    type: "object",
    properties: {
        id: {
            type: "integer", nullable: true,
            errorMessage: "Ungültige ID verwendet.",
        },
        name: {
            type: "string", minLength: 3, maxLength: 100,
            pattern: "^[\\sa-zA-Z\u00c4\u00e4\u00d6\u00f6\u00dc\u00fc]*$",
            errorMessage: "Ungültiger Wert für den Namen verwendet. (min. 3, maximal 100 Zeichen, nur A-Z und Umlaute)",
        },
        shortName: {
            type: "string", minLength: 1, maxLength: 3,
            pattern: "^[a-zA-Z]*$",
            errorMessage: "Ungültiger Wert für das Kürzel verwendet. (min. 1, maximal 3 Zeichen, nur A-Z)",
        },
    },
    errorMessage: {
        required: {
            name: "Name fehlt.",
            shortName: "Kürzel fehlt.",
        },
    },
    required: ["name", "shortName"],
    additionalProperties: false
};

export default TeamSchema;