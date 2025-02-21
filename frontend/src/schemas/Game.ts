import {JSONSchemaType} from "ajv";
import GameRequest from "../types/request/GameRequest";

const GameSchema: JSONSchemaType<GameRequest> = {
    type: "object",
    properties: {
        id: {
            type: "integer", nullable: true,
            errorMessage: "Ungültige ID verwendet.",
        },
        teamHome: {
            type: "integer",
            errorMessage: "Ungültige Heimmannschafts-ID verwendet.",
        },
        teamGuest: {
            type: "integer",
            errorMessage: "Ungültige Gastmannschafts-ID verwendet.",
        },
        stage: {
            type: "integer",
            errorMessage: "Ungültige Gruppen-ID verwendet.",
        },
        tournament: {
            type: "integer",
            errorMessage: "Ungültige Turnier-ID verwendet.",
        },
        start: {
            type: "string", pattern: "^[0-3][0-9]\\.[0-1][0-9]\\.[0-9]{4}\\s[0-2][0-9]:[0-5][0-9]$",
            errorMessage: "Ungültiges Datum verwendet.",
        },
        scoreTeamHome: {
            type: ["integer", "null"] as unknown as "integer",
            errorMessage: "Ungültiger Wert für Tore der Heimmannschaft verwendet.",
        },
        scoreTeamGuest: {
            type: ["integer", "null"] as unknown as "integer",
            errorMessage: "Ungültiger Wert für Tore der Gastmannschaft verwendet.",
        },
        gameEnd: {
            type: ["string", "null"] as unknown as "string",
            oneOf: [
                {
                    enum: ["regular", "overtime", "penalty"],
                },
                {
                    type: "null",
                    nullable: true,
                }
            ],
            errorMessage: "Ungültiger Wert für das Spielende verwendet.",
        },
    },
    errorMessage: {
        required: {
            tournament: "Turnier-ID fehlt.",
            stage: "Gruppen-ID fehlt.",
            teamHome: "Heimmannschafts-ID fehlt.",
            teamGuest: "Gastmannschafts-ID fehlt.",
            start: "Anstosszeit fehlt.",
        },
    },
    required: ["teamHome", "teamGuest", "stage", "tournament", "start"],
    additionalProperties: false
};

export default GameSchema;