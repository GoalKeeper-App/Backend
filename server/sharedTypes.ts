export interface GoalEntity {
  goal_uuid: string;
  title: string;
  createdAt: string;  // Erwarte `string` statt `Date | null`
  streak: number;
  completed: boolean;
  contributers: Record<string, any>;  // oder genauer spezifizieren, wenn du die Struktur der Contributers kennst
}

export interface GoalResponse {
  lists: GoalList[]
}

export interface GoalList {
  title: string;
  total_user: number;
  goals: GoalEntity[];
}
//import { insertGoalSchema } from "./db/schema/goals"
/*import { integer, uuid } from 'drizzle-orm/pg-core';
import { v4 as uuidv4 } from 'uuid';

//export const goalSchema = z.object({
//    uuid: z.string().regex(new RegExp("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")),
//    title: z.string()
//        .min(3, "Title must be at least 3 characters")
//        .max(100, "Title must be at most 100 characters"),
//    completed_by: z.optional(z.array(z.string())),
//    streak: z.optional(z.number()),
//    completed: z.boolean()
//})

export const createGoalSchema = insertGoalSchema.omit(
    {
        createdAt: true
    }
)
    */