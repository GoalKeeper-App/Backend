import { useState, useMemo, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, Flame, Plus, Users } from "lucide-react";
import Confetti from "react-confetti";
import { createFileRoute } from "@tanstack/react-router";
import { type GoalEntity, type GoalList } from "@server/sharedTypes";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { SubscribeGoalLists } from "./index";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const Route = createFileRoute("/_authenticated/goals")({
  component: GoalTracker,
});

const GoalItem = ({
  goal,
  totalUser,
  onToggleCompletion,
}: {
  goal: GoalEntity;
  totalUser: number;
  onToggleCompletion: (
    uuid: string,
    completed: boolean,
    allCompleted: boolean
  ) => void;
}) => {
  const completionPercentage = (goal.contributers.length / totalUser) * 100;
  const displayedContributers = goal.contributers.slice(0, 3);
  const remainingContributers = goal.contributers.length - 3;
  const allFriendsCompleted = goal.contributers.length === totalUser;

  const handleCompletion = () => {
    onToggleCompletion(goal.goalUuid, !goal.completed, allFriendsCompleted);
  };

  return (
    <div className="mt-3 pl-0 pr-5 pt-3 relative">
      <Card
        className={`relative border ${
          allFriendsCompleted
            ? "border-amber-200 dark:border-amber-700"
            : goal.completed
              ? "border-green-200 dark:border-green-700"
              : "border-red-200 dark:border-red-700"
        }`}
      >
        <CardContent className="p-2 pt- pr-6">
          <Button
            variant={goal.completed ? "secondary" : "default"}
            size="icon"
            className={`absolute -right-5 top-1/2 -translate-y-1/2 rounded-full w-10 h-10 ${
              allFriendsCompleted
                ? "bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
                : goal.completed
                  ? "bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                  : "bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
            }`}
            onClick={handleCompletion}
          >
            {goal.completed ? (
              <CheckCircle className="h-5 w-5 text-white" />
            ) : (
              <Plus className="h-5 w-5 text-white" />
            )}
          </Button>
          <Badge
            variant="secondary"
            className="absolute -top-4 bg-orange-500 dark:bg-orange-600 text-white px-2 py-1"
          >
            <Flame className="h-3 w-3 mr-1" />
            <span className="font-bold">{goal.streak}</span>
          </Badge>
          <div className="pl-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {goal.title}
            </h3>
            <div className="">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1">
                  <Users
                    className={`h-3 w-3 ${
                      displayedContributers.length === 0
                        ? "text-red-500 dark:text-red-500"
                        : "text-grey-500 dark:text-grey-500}"
                    }
                  `}
                  />
                  <div className="flex">
                    {displayedContributers.map((avatar, index) => (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Avatar
                              key={index}
                              className="border text-[11px] w-5 h-5 border-white dark:border-gray-800"
                            >
                              <AvatarImage alt={avatar.name[0]} />
                              <AvatarFallback>{avatar.name[0]}</AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent className="cursor-default">
                            <p className="cursor-default">{avatar.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                    {remainingContributers > 0 && (
                      <Avatar className="border text-[9px] w-5 h-5 border-white dark:border-gray-800">
                        <AvatarFallback className="text-[8px] font-medium text-gray-600 dark:text-gray-300">
                          +{remainingContributers}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
                <span
                  className={`text-xs font-medium ${
                    allFriendsCompleted
                      ? "text-amber-700 dark:text-amber-300"
                      : goal.completed
                        ? "text-green-700 dark:text-green-300"
                        : "text-red-700 dark:text-red-300"
                  }`}
                ></span>
                <span
                  className={`flex items-center space-x-1 text-xs font-medium ${
                    allFriendsCompleted
                      ? "text-amber-700 dark:text-amber-300"
                      : goal.completed
                        ? "text-green-700 dark:text-green-300"
                        : "text-red-700 dark:text-red-300"
                  }`}
                >
                  {goal.contributers.length}/{totalUser}
                  <Users
                    className={`h-3 w-3 m-1 ${
                      allFriendsCompleted
                        ? "text-amber-700 dark:text-amber-300"
                        : goal.completed
                          ? "text-green-700 dark:text-green-300"
                          : "text-red-700 dark:text-red-300"
                    }`}
                  />
                  - {completionPercentage.toFixed(0)}%
                </span>
              </div>
              <Progress
                value={completionPercentage}
                className={`w-full h-1 ${
                  allFriendsCompleted
                    ? "bg-amber-200 dark:bg-amber-700"
                    : goal.completed
                      ? "bg-green-100 dark:bg-green-900"
                      : "bg-red-200 dark:red-950 dark:bg-red-200"
                }`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

async function getAllGoals() {
  const result = await api.goals.$get();
  if (!result.ok) throw new Error("Server error");
  const data = await result.json();
  return data;
}

export default function GoalTracker() {
  const { isPending, data, error, refetch } = useQuery({
    queryKey: ["get-all-goals"],
    queryFn: getAllGoals,
  });

  if (error) return <div>An error has occurred: {error.message}</div>;
  return (
    <>
      {data?.lists.length === 0 ? (
        <>
          <h1 className="text-xl font-bold">
            No goal lists available. Subscribe to a goal list now!
          </h1>
          <SubscribeGoalLists refetch={refetch} />
        </>
      ) : (
        data?.lists.map((list) => (
          <GoalList
            key={list.title}
            userName={data.userName}
            goalsInput={list}
            refetch={refetch}
          />
        ))
      )}
    </>
  );
}

const GoalList = ({
  userName,
  goalsInput,
  refetch,
}: {
  userName: string;
  goalsInput: GoalList;
  refetch: () => void;
}) => {
  const [goals, setGoals] = useState<GoalEntity[]>(goalsInput.goals);
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
        goal.goalUuid === goalUuid
          ? {
              ...goal,
              completed: completed,
              streak: completed ? goal.streak + 1 : goal.streak - 1,
              contributers: completed
                ? [...goal.contributers, { name: userName }]
                : goal.contributers.filter(
                    (contributer) => contributer.name != userName
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

  const sortedGoals = useMemo(() => {
    return [...goals].sort(() => -1);
  }, [goals]);

  const completedGoalsCount = goals.filter((goal) => goal.completed).length;
  const completionPercentage = (completedGoalsCount / goals.length) * 100;

  return (
    <Card className="max-w-md h-100 mx-auto border shadow-md dark:shadow-neutral-900 dark:bg-inherit">
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={confettiIntensity}
        />
      )}
      <CardContent className="p-5 pt-3">
        <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-gray-100">
          Healthier Lifestyle
        </h1>
        <div className="mb-1">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {completedGoalsCount}/{goals.length} goals completed today
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {completionPercentage.toFixed(0)}%
            </span>
          </div>
          <Progress value={completionPercentage} className="w-full h-2" />
        </div>
        <ScrollArea className="h-[calc(100vh-280px)] pr-3 -mr-4">
          {sortedGoals.map((goal) => (
            <GoalItem
              key={goal.goalUuid}
              goal={goal}
              onToggleCompletion={handleToggleCompletion}
              totalUser={goalsInput.totalUser}
            />
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
