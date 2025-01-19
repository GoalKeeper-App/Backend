import { z } from 'zod';

// Contributers Schema
export const InsertContributerSchema = z.object({
  id: z.string(),
  name: z.string(),
});

// GoalEntity Schema
export const InsertGoalEntitySchema = z.object({
  uuid: z.string(),
  title: z.string(),
  index: z.number(),
  createdAt: z.string(), // In deinem Typ wird `string` erwartet, nicht `Date`
  streak: z.number(),
  completed: z.boolean(),
  contributers: z.array(InsertContributerSchema), // Ein Array von Contributers
});

// GoalList Schema
export const InsertGoalListSchema = z.object({
  uuid: z.string(),
  title: z.string(),
  totalUser: z.number(),
  isOwner: z.boolean(),
  goals: z.array(InsertGoalEntitySchema), // Ein Array von GoalEntity
});

// GoalResponse Schema
export const InsertGoalResponseSchema = z.object({
  userName: z.string(),
  lists: z.array(InsertGoalListSchema), // Ein Array von GoalList
});

export interface GoalEntity {
  uuid: string;
  index: number;
  title: string;
  createdAt: string;  // Erwarte `string` statt `Date | null`
  streak: number;
  completed: boolean;
  contributers: Contributer[];  // oder genauer spezifizieren, wenn du die Struktur der Contributers kennst
}

export interface Contributer {
  id: string;
  name: string;
}

export interface GoalResponse {
  user: Contributer,
  lists: GoalList[]
}

export interface GoalList {
  uuid: string;
  title: string;
  totalUser: number;
  isOwner: boolean;
  goals: GoalEntity[];
}


//import { insertGoalSchema } from "./db/schema/goals"
/*import { integer, uuid } from 'drizzle-orm/pg-core';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

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