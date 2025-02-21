import {JSONSchemaType} from "ajv";
import FinalsBetRequest from "../types/request/FinalsBetRequest";

const FinalsBetSchema: JSONSchemaType<FinalsBetRequest> = {
    type: "object",
    properties: {
        id: {
            type: "integer", nullable: true,
            errorMessage: "Ungültige ID verwendet."
        },
        tournament: {
            type: "integer",
            errorMessage: "Ungültige Turnier-ID verwendet."
        },
        teamGuest: {
            type: "integer",
            errorMessage: "Ungültige Heimmannschafts-ID verwendet.",
        },
        teamHome: {
            type: "integer",
            errorMessage: "Ungültige Gastmannschafts-ID verwendet.",
        },
        user: {
            type: "integer", nullable: true,
            errorMessage: "Ungültige Nutzer-ID verwendet.",
        },
    },
    errorMessage: {
        required: {
            tournament: "Turnier-ID fehlt.",
            teamHome: "Heimmannschafts-ID fehlt.",
            teamGuest: "Gastmannschafts-ID fehlt.",
        },
    },
    required: ["tournament", "teamHome", "teamGuest"],
    additionalProperties: false
};

export default FinalsBetSchema;