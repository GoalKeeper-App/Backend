import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { v4 as uuidv4 } from 'uuid';
import { Schema, z } from 'zod'

const goalSchema = z.object({
  uuid: z.string().regex(new RegExp("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")),
  title: z.string(),
  completed_by: z.array(z.string()),
  streak: z.number(),
  completed: z.boolean()
})

const createPostSchema = goalSchema.omit({uuid: true, completed_by: true, streak: true, completed: true})

type Goal = z.infer<typeof goalSchema>

const fakeGoals: Goal[] = [
  {
    uuid: uuidv4(),
    title: "Test",
    completed_by: ["Paul", "Emma"],
    streak: 2,
    completed: false
  },
  {
    "uuid": "c2a9bda2-4c4f-11e9-8646-d663bd873d93",
    "title": "Go for a run",
    "completed_by": ["Frank"],
    "streak": 3,
    "completed": true,
  },
  {
    "uuid": "f49f0b9e-d2c6-4b5c-8eb4-7d59c7f5d8f3",
    "title": "Morning yoga",
    "completed_by": ["Emma", "Mike"],
    "streak": 7,
    "completed": true,
  },
  {
    "uuid": "9e20d7cc-3bd3-4b27-9ad3-2cf2b4c7e2bc",
    "title": "Weightlifting session",
    "completed_by": [],
    "streak": 2,
    "completed": false,
  },
  {
    "uuid": "b62039c7-72f8-41ff-b8f0-29581f195db8",
    "title": "Swimming",
    "completed_by": [],
    "streak": 4,
    "completed": true,
  },
  {
    "uuid": "a1f1dd3e-5b7c-46d1-8766-1f3a1d1c2bc8",
    "title": "Cycling",
    "completed_by": ["Frank", "Emma"],
    "streak": 5,
    "completed": false,
  },
  {
    "uuid": "ed3c9f33-0d1d-4cbe-bd53-0f1b4e3a1cf8",
    "title": "HIIT workout",
    "completed_by": ["Mike"],
    "streak": 1,
    "completed": true,
  },
  {
    "uuid": "57a54e7b-ef69-4ebc-bc1f-6f99b093ea68",
    "title": "Evening walk",
    "completed_by": ["Sarah"],
    "streak": 6,
    "completed": false,
  },
  {
    "uuid": "ddf54862-0f4d-4cbe-8ad9-b2f3c8e4ec5e",
    "title": "Pilates",
    "completed_by": ["John", "Emma"],
    "streak": 3,
    "completed": true,
  }
]

export const goalsRoute = new Hono()
  .get("/", c => {
    return c.json({
      "Fitness": [
        { fakeGoals }
      ]
    })
  })
  .post("/", zValidator("json", createPostSchema), async (c) => {
    const goal = await c.req.valid("json")
    fakeGoals.push({ ...goal, uuid: uuidv4(), completed: false })
    return c.json(goal)
  })
  //regex for uuid validation
  .get("/:id{[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$}", (c) => {
    //const id = Number.parseInt(c.req.param("id"))
    const uuid = c.req.param("id");
    const goal = fakeGoals.find(goal => goal.uuid === uuid)

    if (!goal)
      return c.notFound()

    c.status(201)
    return c.json({ goal })
  })
  .delete("/:id{[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$}", (c) => {
    const uuid = c.req.param("id");
    const index = fakeGoals.findIndex(goal => goal.uuid === uuid)

    if(index === -1)
      return c.notFound()

    const deletedGoal = fakeGoals.splice(index, 1)[0]

    return c.json({ goal: deletedGoal })
  })
// .put