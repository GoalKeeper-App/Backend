import { api } from "@/lib/api";
import {
  Contributer,
  GoalEntity,
  InsertGoalListSchema,
  type GoalList as typeGoalList,
} from "@server/sharedTypes";
import { useEffect, useMemo, useState } from "react";
import Confetti from "react-confetti";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";
import { GoalItem } from "./goal-item";
import { EditGoalList } from "./edit-goal-list/edit-goal-list";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export const GoalList = ({
  user,
  goalList,
  refetch,
  onDelete,
}: {
  user: Contributer;
  goalList: typeGoalList;
  refetch: () => void;
  onDelete: (goalListUuid: string) => void;
}) => {
  const [title, setTitle] = useState<string>(goalList.title);
  const [goals, setGoals] = useState<GoalEntity[]>(goalList.goals);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiIntensity, setConfettiIntensity] = useState(0);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const handleToggleCompletion = async (
    goalUuid: string,
    completed: boolean
  ) => {
    setGoals(
      goals.map((goal) =>
        goal.uuid === goalUuid
          ? {
              ...goal,
              completed: completed,
              streak: completed ? goal.streak + 1 : goal.streak - 1,
              contributers: completed
                ? [
                    ...goal.contributers,
                    {
                      id: user.id,
                      name: user.name,
                    },
                  ]
                : goal.contributers.filter(
                    (contributer) => contributer.id != user.id
                  ),
            }
          : goal
      )
    );

    await api.goals.complete.$post({
      json: {
        goalUuid: goalUuid,
        completed: completed,
      },
    });

    if (completed) {
      setShowConfetti(true);
      setConfettiIntensity(200);
    }

    await refetch();
  };

  const completedGoalsCount = goals.filter((goal) => goal.completed).length;
  const completionPercentage = (completedGoalsCount / goals.length) * 100;

  async function OnSave(goalList: typeGoalList) {
    setGoals(goalList.goals);
    setTitle(goalList.title);
    console.log(goalList);
    const validatedGoalList = InsertGoalListSchema.parse(goalList);
    await api.goals["goal-list"].$post({ json: validatedGoalList });
  }

  return (
    <div className="">
      <Card className="mt-4 w-full max-w-md mx-auto border shadow-md dark:shadow-neutral-900 dark:bg-inherit relative">
        {showConfetti && (
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
            numberOfPieces={confettiIntensity}
          />
        )}
        <CardContent className="p-4 pt-2">
          {goalList.isOwner ? (
            <EditGoalList
              goalList={goalList}
              onDelete={onDelete}
              onSave={OnSave}
            />
          ) : null}

          <h1 className="text-xl font-bold mb-1 text-gray-900 dark:text-gray-100">
            {title}
          </h1>
          <div className="mb-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {completedGoalsCount}/{goals.length}
              </span>
              <Progress
                value={completionPercentage}
                className="w-full mr-3 ml-3 h-2"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {completionPercentage.toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="max-h-[73vh] sm:max-h-[77vh]  md:max-h-[79vh] lg:max-h-[78vh] overflow-scroll pr-1 -mr-3">
            {goals
              .sort((goal1, goal2) => goal1.index - goal2.index)
              .map((goal) => (
                <GoalItem
                  key={goal.uuid}
                  goal={goal}
                  onToggleCompletion={handleToggleCompletion}
                  totalUser={goalList.totalUser}
                />
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
