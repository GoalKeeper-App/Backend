import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { getUser } from "../kind";
import { db } from "../db";
import { goals as goalsTable, userGoalLists as userGoalListsTable, goalLists as goalListTable, userAchievements as userAchievementsTable, insertUserAchivementsSchema, insertUserGoalListsSchema, goalLists } from '../db/schema/goals';
import { and, count, eq, exists, ne, sql } from "drizzle-orm";
import { type GoalResponse, type GoalList, InsertGoalListSchema } from '../sharedTypes';
import { users as usersTable } from "../db/schema/users";
import { z } from "zod";
//import { createGoalSchema } from "../sharedTypes";
import { uuid } from 'drizzle-orm/pg-core';

export const goalsRoute = new Hono()
  .get("/", getUser, async c => {
    const user = c.var.user

    const isYesterdayParam = c.req.query('isYesterday') ?? '';
    const isYesterday: boolean = isYesterdayParam.toLowerCase() === 'true';

    console.log(isYesterday)

    let userDB = await db
      .select({
        name: usersTable.name,
        id: usersTable.id
      })
      .from(usersTable)
      .where(eq(usersTable.id, user.id))
      .limit(1)
      .then(res => res[0]);

    if (userDB === undefined) {
      await db
        .insert(usersTable)
        .values({
          id: user.id,
          name: user.given_name
        });

      userDB = await db
        .select({
          name: usersTable.name,
          id: usersTable.id
        })
        .from(usersTable)
        .where(eq(usersTable.id, user.id))
        .limit(1)
        .then(res => res[0]);
    }

    const userGoalLists = await db
      .select()
      .from(goalListTable)
      .leftJoin(userGoalListsTable, eq(goalListTable.uuid, userGoalListsTable.goalListUuid))
      .where(eq(userGoalListsTable.userId, user.id))

    const lists: GoalList[] = await Promise.all(userGoalLists.map(async (goalList) => {
      const totalGoalListUser = await db
        .select({ total: count(userGoalListsTable.userId) })
        .from(userGoalListsTable)
        .where(eq(userGoalListsTable.goalListUuid, goalList.goal_lists.uuid))
        .then(res => res[0]?.total);

      const dayExpr = isYesterday
        ? sql`CURRENT_DATE - INTERVAL '1 day'`
        : sql`CURRENT_DATE`;

      const goals = await db
        .select({
          uuid: goalsTable.uuid,
          title: goalsTable.title,
          index: goalsTable.index,
          createdAt: goalsTable.createdAt,

          // 2. Im "completed"-Feld nutzen wir dayExpr anstelle von CURRENT_DATE
          completed: sql<boolean>`
            (
              SELECT COALESCE(
                (SELECT ${userAchievementsTable.completed} 
                 FROM ${userAchievementsTable} 
                 WHERE DATE(${userAchievementsTable.achievedAt}) = ${dayExpr}
                   AND goal_uuid = ${goalsTable.uuid}
                   AND user_id = ${user.id}
                 LIMIT 1), 
              false)
            )
          `.as('completed'),

          // 3. Auch im Streak-Berechnen ersetzen wir alle Stellen mit CURRENT_DATE
          //    durch dayExpr — inklusive der Vergleiche im CASE WHEN.
          streak: sql<number>`
            (
              WITH first_entry_dates AS (
                SELECT achieved_at::date AS entry_date
                FROM ${userAchievementsTable}
                WHERE user_id = ${user.id}
                  AND goal_uuid = ${goalsTable.uuid}
                  AND completed = true
                  AND achieved_at::date <= ${dayExpr}  -- hier statt <= CURRENT_DATE
              ),
              consecutive_days AS (
                SELECT entry_date,
                       entry_date - ROW_NUMBER() OVER (ORDER BY entry_date) * interval '1 day' AS streak_group
                FROM first_entry_dates
              ),
              streak_lengths AS (
                SELECT streak_group,
                       MIN(entry_date) AS start_date,
                       MAX(entry_date) AS end_date,
                       COUNT(*) AS streak_length
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
                CASE 
                  WHEN ${dayExpr} BETWEEN latest_streak.start_date AND latest_streak.end_date
                       OR ${dayExpr} - INTERVAL '1 day' BETWEEN latest_streak.start_date AND latest_streak.end_date
                  THEN latest_streak.streak_length
                  ELSE 0
                END, 0
              ) AS streak
              FROM latest_streak
              RIGHT JOIN (SELECT 1) AS dummy ON TRUE
            )
          `.as('streak')
        })
        .from(goalsTable)
        .where(eq(goalsTable.listUuid, goalList.goal_lists.uuid));

      return {
        uuid: goalList.goal_lists.uuid,
        title: goalList.goal_lists.title,
        totalUser: totalGoalListUser,
        isOwner: goalList.goal_lists.createdFrom === user.id,
        goals: await Promise.all(await goals.map(async (goal) => ({
          uuid: goal.uuid,
          title: goal.title,
          index: goal.index ?? -1,
          completed: goal.completed,
          createdAt: goal.createdAt ? goal.createdAt.toISOString() : "",
          streak: Number(goal.streak),
          contributers: await db
            .select({
              name: usersTable.name,
              id: usersTable.id
            })
            .from(userAchievementsTable)
            .where(and(
              sql<boolean>`DATE(${userAchievementsTable.achievedAt}) = current_date`,
              eq(userAchievementsTable.completed, true)))
            .innerJoin(
              usersTable,
              eq(usersTable.id, userAchievementsTable.userId))
            .innerJoin(
              goalsTable,
              and(
                and(
                  eq(goalsTable.uuid, goal.uuid),
                  eq(userAchievementsTable.goalUuid, goal.uuid)),
                eq(goalsTable.listUuid, goalList.goal_lists.uuid)))
        })))
      };
    }));

    return c.json<GoalResponse>({
      user: { id: userDB.id, name: userDB.name },
      lists: lists
    });
  })
  .get("/achieved-goals", getUser, async (c) => {
    const user = c.var.user
    let result = await db
      .select({ total: count() })
      .from(userAchievementsTable)
      .where(and(eq(userAchievementsTable.completed, true),
        eq(userAchievementsTable.userId, user.id)))
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
            WHERE ${userGoalListsTable.goalListUuid} = ${goalListTable.uuid}
            AND ${userGoalListsTable.userId} = ${user.id}
          )
        `.as('subscribed'),
      })
      .from(goalListTable)

    const goalListsWithGoals = await Promise.all(goalLists.map(async (goalList) => {
      const goalsForList = await db
        .select({ title: goalsTable.title, uuid: goalsTable.uuid, index: goalsTable.index })
        .from(goalsTable)
        .where(eq(goalsTable.listUuid, goalList.uuid));

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
  .post("goal-list", getUser, zValidator("json", InsertGoalListSchema), async (c) => {
    const user = c.var.user;
    const goalListSchema = await c.req.valid("json")

    //TODO check if user is owner
    if (!goalListSchema.isOwner) {
      c.status(500)
      c.json({ error: "error" })
    }

    const dbGoals = await db
      .select({ uuid: goalsTable.uuid })
      .from(goalsTable)
      .where(eq(goalsTable.listUuid, goalListSchema.uuid));

    const goalListUuids = goalListSchema.goals.map((goal) => goal.uuid);

    const removedGoals = dbGoals.filter(
      (dbGoal) => !goalListUuids.includes(dbGoal.uuid)
    );

    const removedGoalsDB = await Promise.all(removedGoals.map(async goal => {
      return await db
        .update(goalsTable)
        .set({ listUuid: null })
        .where(eq(goalsTable.uuid, goal.uuid))
        .returning();
    }))


    const updatedGoalList = await db
      .update(goalListTable)
      .set({ title: goalListSchema.title })
      .where(eq(goalListTable.uuid, goalListSchema.uuid))
      .returning();

    const updatedGoalsUuid = (
      await Promise.all(goalListSchema.goals.map(async (goal) => {
        return await db
          .update(goalsTable)
          .set({ title: goal.title, index: goal.index })
          .where(eq(goalsTable.uuid, goal.uuid))
          .returning()
          .then(res => res[0] || null); // Falls das Ergebnis leer ist, null zurückgeben
      }))
    )
      .filter(goal => goal !== null) // Filtert alle null-Werte heraus
      .map(goal => goal?.uuid) || [];

    const newGoals = goalListSchema.goals.filter(goal =>
      !updatedGoalsUuid.includes(goal.uuid))

    const newGoalsDB = await Promise.all(newGoals.map(async goal => {
      return await db
        .insert(goalsTable)
        .values({ title: goal.title, index: goal.index, listUuid: goalListSchema.uuid })
        .returning()
        .then(res => res[0])
    }))

    c.status(201)
    return c.json({ updatedGoalList, goals: newGoalsDB });
  })
  .delete("goal-list/:uuid{[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$}", getUser, async (c) => {
    const uuid = c.req.param("uuid") ?? "";

    const deletedUserGoalList = await db
      .delete(userGoalListsTable)
      .where(eq(userGoalListsTable.goalListUuid, uuid))
      .returning()
      .then(res => res[0]);

    return c.json({ deletedUserGoalList });
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