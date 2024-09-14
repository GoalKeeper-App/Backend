//bunx drizzle-kit generate
//bun migrate.ts

import { uuid, pgTable, uniqueIndex, text, timestamp, integer, primaryKey, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const goalLists = pgTable('goal_lists', {
    uuid: uuid('uuid').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const userGoalLists = pgTable('user_goal_lists', {
    userId: text("user_id"),
    goalList_uuid: uuid("goal_list_uuid").references(() => goalLists.uuid),
    subscribedAt: timestamp("subscribed_at").defaultNow(),
}, (userGoalLists) => {
    return {
        //pk: primaryKey({ columns: [userAchievements.goalUuid, userAchievements.userUuid, userAchievements.achievedAt] }),
        pkUserAchviement: primaryKey({ name: 'pk_user_goal_lists', columns: [userGoalLists.userId, userGoalLists.goalList_uuid] }),
    };
});

export const goals = pgTable('goals', {
    uuid: uuid('uuid').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    listUuid: uuid("list_uuid").notNull().references(() => goalLists.uuid)
});

export const userAchievements = pgTable('user_achievements', {
    userId: text("user_id"),
    goalUuid: uuid("goal_uuid").references(() => goals.uuid),
    achievedAt: timestamp("achieved_at").defaultNow(),
    completed: boolean("completed").default(false)
}, (userAchievements) => {
    return {
        //pk: primaryKey({ columns: [userAchievements.goalUuid, userAchievements.userUuid, userAchievements.achievedAt] }),
        pkUserAchviement: primaryKey({ name: 'pk_user_achviement', columns: [userAchievements.goalUuid, userAchievements.userId, userAchievements.achievedAt] }),
    };
});

export const insertUserGoalListsSchema = createInsertSchema(userGoalLists);
export const insertUserAchivementsSchema = createInsertSchema(userAchievements);
export const selectGoalListsSchema = createSelectSchema(goalLists);


//export const selectGoalListsSchema = createSelectSchema(goalLists);
//export const selectGoalsSchema = createSelectSchema(goals);
//export const selectUserAchievementsSchema = createSelectSchema(userAchievements);