import { GoalEntity } from "@server/sharedTypes";
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { CheckCircle, Flame, Plus, Users } from "lucide-react";
import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Progress } from "./ui/progress";

export const GoalItem = ({
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
  const [disabled, setDisabled] = useState(false);
  const completionPercentage = (goal.contributers.length / totalUser) * 100;
  const displayedContributers = goal.contributers.slice(0, 3);
  const remainingContributers = goal.contributers.length - 3;
  const allFriendsCompleted = goal.contributers.length === totalUser;

  const handleCompletion = () => {
    setDisabled(true);
    setTimeout(() => {
      setDisabled(false);
    }, 500);
    onToggleCompletion(goal.uuid, !goal.completed, allFriendsCompleted);
  };

  return (
    <div className="mt-2 pl-3 pr-5 relative">
      <Card
        className={`relative border ${
          allFriendsCompleted
            ? "border-amber-200 dark:border-amber-700"
            : goal.completed
              ? "border-green-200 dark:border-green-700"
              : "border-red-200 dark:border-red-700"
        }`}
      >
        <CardContent className="p-1 pl-3 pr-6">
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
            disabled={disabled}
            onClick={handleCompletion}
          >
            {goal.completed ? (
              <CheckCircle className="h-5 w-5 text-white" />
            ) : (
              <Plus className="h-5 w-5 text-white" />
            )}
          </Button>
          {/*
          <Badge
            variant="secondary"
            className="absolute -top-4 bg-orange-500 dark:bg-orange-600 text-white px-2 py-1"
          >
            <Flame className="h-3 w-3 mr-1" />
            <span className="font-bold">{goal.streak}</span>
          </Badge>
          */}

          <Badge
            variant="secondary"
            className="absolute -left-3 top-1/2 flex -translate-y-1/2 bg-orange-500 dark:bg-orange-600 text-white px-1 py-1.5"
          >
            <div className="flex flex-col text-center">
              <Flame className="h-3 w-3" />
              <div className="font-bold">{goal.streak}</div>
            </div>
          </Badge>
          <div className="pl-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
              {goal.title}
            </h3>
            <div
              className={`dark:text-${
                allFriendsCompleted ? "amber" : goal.completed ? "green" : "red"
              }-500`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-1">
                  <Users
                    className={`h-3 w-3 mr-1 text-xs text-${
                      allFriendsCompleted
                        ? "amber"
                        : goal.completed
                          ? "green"
                          : "red"
                    }-500`}
                  />
                  <div className="flex">
                    {displayedContributers.length === 0 ? (
                      <Badge variant="secondary" className="text-xs  mr-1">
                        <span></span>
                      </Badge>
                    ) : null}
                    {displayedContributers.map((contributer) => (
                      <Badge variant="secondary" className="text-xs h-4 p-2 w-auto mr-1">
                        <span>{contributer.name}</span>
                      </Badge>
                    ))}
                    {remainingContributers > 0 ? (
                      <Badge variant="secondary" className="text-xs mr-1">
                        <span>+{remainingContributers}</span>
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <span
                  className={`flex items-center space-x-1 text-xs font-medium text-${
                    allFriendsCompleted
                      ? "amber"
                      : goal.completed
                        ? "green"
                        : "red"
                  }-500`}
                >
                  {goal.contributers.length}/{totalUser}
                  <Users
                    className={`h-3 w-3 m-1 ${
                      allFriendsCompleted
                        ? "text-amber-500"
                        : goal.completed
                          ? "text-green-500"
                          : "text-red-500"
                    }`}
                  />
                  {/*" - "}
                    {{completionPercentage.toFixed(0)}%*/}
                </span>
              </div>
              <Progress
                value={completionPercentage}
                className={`w-full h-1 ${
                  allFriendsCompleted
                    ? "indicator-dark:bg-amber-500 indicator-bg-amber-500"
                    : goal.completed
                      ? "indicator-dark:bg-green-600 indicator-bg-green-600"
                      : "indicator-dark:bg-red-600 indicator-bg-red-600"
                }`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
