import {JSONSchemaType} from "ajv";
import TournamentRequest from "../types/request/TournamentRequest";

const TournamentSchema: JSONSchemaType<TournamentRequest> = {
    type: "object",
    properties: {
        id: {
            type: "integer", nullable: true,
            errorMessage: "Ungültige ID verwendet.",
        },
        name: {
            type: "string", minLength: 3, maxLength: 100,
            pattern: "^[\\sa-zA-Z0-9_\\-\\.\\+#]*$",
            errorMessage: "Ungültiger Wert für den Namen verwendet. (min. 3, maximal 100 Zeichen, nur A-Z + Nummern und Sonderzeichen wie -.+#)",
        },
        isActive: {
            type: "boolean",
            errorMessage: "Ungültiger Wert für Ist-Aktiv verwendet.",
        },
        correctBetScore: {
            type: "integer",
            errorMessage: "Ungültiger Wert für korrekte Tipps verwendet.",
        },
        tendingBetScore: {
            type: "integer",
            errorMessage: "Ungültiger Wert für tendenzielle Tipps verwendet.",
        },
        finalBetScore: {
            type: "integer",
            errorMessage: "Ungültiger Wert für Finaltipps verwendet.",
        },
        gameEndScore: {
            type: "integer",
            errorMessage: "Ungültiger Wert für das Spielende verwendet.",
        },
    },
    errorMessage: {
        required: {
            name: "Name fehlt.",
            isActive: "Einstellung für Ist-Aktiv fehlt.",
            gameEndScore: "Punkte für Spielende fehlen.",
            correctBetScore: "Punkte für korrekte Tipps fehlen.",
            tendingBetScore: "Punkte für tendenzielle Tipps fehlen.",
            finalBetScore: "Punkte für Finaltipps fehlen.",
        },
    },
    required: ["name", "isActive", "correctBetScore", "tendingBetScore", "finalBetScore", "gameEndScore"],
    additionalProperties: false
};

export default TournamentSchema;