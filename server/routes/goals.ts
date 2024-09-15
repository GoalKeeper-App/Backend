import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { getUser } from "../kind";
import { db } from "../db";
import { goals as goalsTable, userGoalLists as userGoalListsTable, goalLists as goalListTable, userAchievements as userAchievementsTable, insertUserAchivementsSchema, insertUserGoalListsSchema, goals } from '../db/schema/goals';
import { and, count, eq, exists, sql } from "drizzle-orm";
import { type GoalResponse, type GoalList } from '../sharedTypes';
//import { createGoalSchema } from "../sharedTypes";

export const goalsRoute = new Hono()
  .get("/", getUser, async c => {
    const user = c.var.user
    const userGoalLists = await db
      .select()
      .from(goalListTable)
      .leftJoin(userGoalListsTable, eq(goalListTable.uuid, userGoalListsTable.goalList_uuid))
      .where(eq(userGoalListsTable.userId, user.id))

    const lists: GoalList[] = await Promise.all(userGoalLists.map(async (goalList) => {
      const totalGoalListUser = await db
        .select({ total: count(userGoalListsTable.userId) })
        .from(userGoalListsTable)
        .where(eq(userGoalListsTable.goalList_uuid, goalList.goal_lists.uuid))
        .then(res => res[0]?.total);

      const goals = await db
        .select({
          uuid: goalsTable.uuid,
          title: goalsTable.title,
          createdAt: goalsTable.createdAt,
          completed: sql<boolean>`
              (
                SELECT COALESCE(
                  (SELECT ${userAchievementsTable.completed} 
                   FROM user_achievements 
                   WHERE DATE(${userAchievementsTable.achievedAt}) = CURRENT_DATE
                   AND goal_uuid = ${goalsTable.uuid}
                   AND user_id = ${user.id}
                   LIMIT 1), 
                false)
              )`.as('completed'),
          streak: sql<number>`
              (
                WITH first_entry_dates AS (
                    SELECT achieved_at::date AS entry_date
                    FROM user_achievements
                    WHERE user_id = ${user.id}
                    AND goal_uuid = ${goalsTable.uuid}
                    AND completed = true  -- Ensure only completed entries are counted
                    AND achieved_at::date <= CURRENT_DATE
                ),
                consecutive_days AS (
                    SELECT entry_date, entry_date - ROW_NUMBER() OVER (ORDER BY entry_date) * interval '1 day' AS streak_group
                    FROM first_entry_dates
                ),
                streak_lengths AS (
                    SELECT streak_group, MIN(entry_date) AS start_date, MAX(entry_date) AS end_date, COUNT(*) AS streak_length
                    FROM consecutive_days
                    GROUP BY streak_group
                ),
                latest_streak AS (
                    SELECT streak_length, start_date, end_date
                    FROM streak_lengths
                    ORDER BY end_date DESC
                    LIMIT 1
                )
                SELECT COALESCE(
                  CASE WHEN CURRENT_DATE BETWEEN latest_streak.start_date AND latest_streak.end_date
                        OR CURRENT_DATE - INTERVAL '1 day' BETWEEN latest_streak.start_date AND latest_streak.end_date
                    THEN latest_streak.streak_length
                    ELSE 0
                  END, 0) AS streak
                FROM latest_streak
                RIGHT JOIN (SELECT 1) AS dummy ON TRUE
              )`.as('streak')
        })
        .from(goalsTable)
        .where(eq(goalsTable.listUuid, goalList.goal_lists.uuid));

      return {
        title: goalList.goal_lists.title,
        total_user: totalGoalListUser,
        goals: goals.map((goal) => ({
          goal_uuid: goal.uuid,
          title: goal.title,
          completed: goal.completed,
          createdAt: goal.createdAt ? goal.createdAt.toISOString() : "",  // Konvertiert `Date` zu `string`
          streak: Number(goal.streak),
          contributers: {}  // Placeholder, später spezifizieren
        }))
      };
    }));

    return c.json<GoalResponse>({
      lists: lists  // `lists` enthält jetzt synchronisierte Daten
    });
  })
  .get("/total-goals", getUser, async (c) => {
    const user = c.var.user
    let result = await db
      .select({ total: count(goalsTable.uuid) })
      .from(goalsTable)
      .limit(1)
      .then(res => res[0])
    return c.json({ result })
  })
  .post("/complete", getUser, zValidator("json", insertUserAchivementsSchema), async (c) => {
    const user = c.var.user
    const userAchievement = await c.req.valid("json")

    let exist = await db
      .select({
        exist: sql<boolean>`
          EXISTS (
            SELECT 1 
            FROM ${userAchievementsTable}
            WHERE DATE(${userAchievementsTable.achievedAt}) = CURRENT_DATE
              AND ${userAchievementsTable.goalUuid} = ${userAchievement.goalUuid}
              AND ${userAchievementsTable.userId} = ${user.id}
          )
        `.as('exist')
      })
      .from(userAchievementsTable)
      .limit(1)
      .then(res => res[0]?.exist ?? false);

    let result = null
    if (exist) {
      result = await db
        .update(userAchievementsTable)
        .set({ completed: userAchievement.completed })
        .where(and(
          (sql`DATE(${userAchievementsTable.achievedAt}) = CURRENT_DATE`),
          and(
            eq(userAchievementsTable.goalUuid, userAchievement.goalUuid ?? "")),
          eq(userAchievementsTable.userId, user.id)))
        .returning();
    } else {
      result = await db
        .insert(userAchievementsTable)
        .values({
          ...userAchievement,
          userId: user.id
        }).returning();
    }

    c.status(201)
    return c.json(result)
  })
  .get("/goal-lists", getUser, async (c) => {
    const user = c.var.user;

    const goalLists = await db
      .select({
        uuid: goalListTable.uuid,
        title: goalListTable.title,
        createdAt: goalListTable.createdAt,
        subscribed: sql<boolean>`
          EXISTS (
            SELECT 1 FROM ${userGoalListsTable}
            WHERE ${userGoalListsTable.goalList_uuid} = ${goalListTable.uuid}
            AND ${userGoalListsTable.userId} = ${user.id}
          )
        `.as('subscribed'),
      })
      .from(goalListTable)

    const goalListsWithGoals = await Promise.all(goalLists.map(async (goalList) => {
      const goalsForList = await db
        .select({ title: goals.title, uuid: goals.uuid })
        .from(goals)
        .where(eq(goals.listUuid, goalList.uuid));

      return {
        ...goalList,
        goals: goalsForList,
      };
    }))

    return c.json(goalListsWithGoals);
  })
  .post("/subscribe-goal-list", getUser, zValidator("json", insertUserGoalListsSchema), async (c) => {
    const user = c.var.user;
    const userGoalList = await c.req.valid("json")

    const result = await db
      .insert(userGoalListsTable)
      .values({
        ...userGoalList,
        userId: user.id
      }).returning();

    return c.json(result)
  })

/*.post("/", getUser, zValidator("json", createGoalSchema), async (c) => {
  const goal = await c.req.valid("json")

  const validatedGoal = insertGoalSchema.parse({ ...goal })

  const result = await db
    .insert(goalsTable).values({ ...goal })
    .returning()
    .then(res => res[0])

  c.status(201)
  return c.json(result)
})
//regex for uuid validation
.get("/:id{[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$}", getUser, async (c) => {
  const uuid = c.req.param("id");
  const goal = await db
    .select().from(goalsTable)
    .where(eq(goalsTable.uuid, uuid))
    .limit(1)
    .then(res => res[0])

  if (!goal)
    return c.notFound()

  c.status(201)
  return c.json({ goal })
})
.delete("/:id{[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$}", getUser, async (c) => {
  //const index = fakeGoals.findIndex(goal => goal.uuid === uuid)
  //if (index === -1)
  //  return c.notFound()
  //const deletedGoal = fakeGoals.splice(index, 1)[0]

  const uuid = c.req.param("id");
  const deletedGoal = await db
    .delete(goalsTable)
    .where(eq(goalsTable.uuid, uuid))
    .returning()
    .then(res => res[0])

  if (!deletedGoal)
    return c.notFound()

  c.status(201)
  return c.json({ goal: deletedGoal })
})
// .put*/