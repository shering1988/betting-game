import {JSONSchemaType} from "ajv";
import BetRequest from "../types/request/BetRequest";

const BetSchema: JSONSchemaType<BetRequest> = {
    type: "object",
    properties: {
        id: {
            type: "integer", nullable: true,
            errorMessage: "Ungültige ID verwendet.",
        },
        game: {
            type: "integer",
            errorMessage: "Ungültige Spiel-ID verwendet.",
        },
        teamHomeScore: {
            type: "integer",
            maximum: 15,
            minimum: 0,
            errorMessage: "Ungültiger Wert für Tore der Heimmannschaft."
        },
        teamGuestScore: {
            type: "integer",
            maximum: 15,
            minimum: 0,
            errorMessage: "Ungültiger Wert für Tore der Gastmannschaft."
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
        user: {
            type: "integer", nullable: true,
            errorMessage: "Ungültige Nutzer-ID verwendet."
        },
    },
    errorMessage: {
        required: {
            game: "Spiel-ID fehlt.",
            teamHomeScore: "Tore für die Heimmannschaft fehlen.",
            teamGuestScore: "Tore für die Gastmannschaft fehlen.",
        },
    },
    required: ["game", "teamHomeScore", "teamGuestScore"],
    additionalProperties: false
};

export default BetSchema;