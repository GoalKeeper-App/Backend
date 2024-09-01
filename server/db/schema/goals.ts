import { uuid, pgTable, uniqueIndex, text, timestamp } from 'drizzle-orm/pg-core';

export const goals = pgTable('goals', {
    uuid: uuid('uuid').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    createdAt: timestamp("created_at").defaultNow()
}, (goals) => {
    return {
        uuidIndex: uniqueIndex('uuser_idx').on(goals.uuid),
    }
});