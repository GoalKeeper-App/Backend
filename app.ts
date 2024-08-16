import { Hono } from "hono";
import { logger } from "hono/logger";

const app = new Hono()

app.use('*', logger())

app.get("/goals", c => {
    return c.json({
        "List 1": [
        {
          name: "Sport gemacht 🚴🏋️",
          completed_by: ["user_1"],
          streak: 3,
          completed: true,
        },
        {
          name: "Schritte erreicht 🚶🏻",
          completed_by: ["user_1", "user_2"],
          streak: 0,
          completed: false,
        },
        {
          name: "Wasser getrunken 💧",
          completed_by: ["user_2"],
          streak: 5,
          completed: true,
        },
        {
          name: "Proteine gedeckt 🥩",
          completed_by: ["user_1"],
          streak: 3,
          completed: true,
        },
        {
          name: "Vitamine genommen 💊",
          completed_by: [],
          streak: -2,
          completed: false,
        },
        {
          name: "8 Stunden geschlafen 💤",
          completed_by: ["user_1", "user_3"],
          streak: 4,
          completed: true,
        },
      ],
      "List 2": [
        {
          name: "Meditation gemacht 🧘‍♂️",
          completed_by: ["user_2"],
          streak: 2,
          completed: true,
        },
        {
          name: "Gesundes Frühstück 🥗",
          completed_by: ["user_1"],
          streak: 1,
          completed: true,
        },
        {
          name: "Zucker reduziert 🍬",
          completed_by: [],
          streak: 0,
          completed: false,
        },
      ],
      "List 3": [
        {
          name: "Tagebuch geschrieben 📓",
          completed_by: ["user_3"],
          streak: 6,
          completed: true,
        },
        {
          name: "Neue Fähigkeit gelernt 📚",
          completed_by: ["user_2"],
          streak: 1,
          completed: true,
        },
        {
          name: "Soziale Kontakte gepflegt ☕️",
          completed_by: ["user_1", "user_3"],
          streak: 0,
          completed: false,
        },
      ],
      "List 4": [
        {
          name: "Tagebuch geschrieben 📓",
          completed_by: ["user_3"],
          streak: 6,
          completed: true,
        },
        {
          name: "Neue Fähigkeit gelernt 📚",
          completed_by: ["user_2"],
          streak: 1,
          completed: true,
        },
        {
          name: "Soziale Kontakte gepflegt ☕️",
          completed_by: ["user_1", "user_3"],
          streak: 0,
          completed: false,
        },
      ],    
    })
})

export default app