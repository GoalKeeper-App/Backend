import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/")({
  component: Index,
});

async function getTotalGoals() {
  const result = await api.goals["total-goals"].$get();
  if (!result.ok) throw new Error("server error");
  const data = await result.json();
  return data;
}

async function getGoalLists() {
  const result = await api.goals["goal-lists"].$get();
  if (!result.ok) throw new Error("server error");
  const data = await result.json();
  return data;
}

export const SubscribeGoalLists = ({ refetch }: { refetch: () => void }) => {
  const goalListsQuery = useQuery({
    queryKey: ["get-goal-lists"],
    queryFn: getGoalLists,
  });

  let goalLists = goalListsQuery.data;
  if (goalListsQuery.error)
    return "An error has occurred: " + goalListsQuery.error.message;

  const toggleSubscription = async (listUuid: string) => {
    const updatedGoalLists = await Promise.all(
      goalLists!.map(async (list) => {
        if (list.uuid === listUuid && !list.subscribed) {
          await api.goals["subscribe-goal-list"].$post({
            json: { goalList_uuid: list.uuid },
          });
          return { ...list, subscribed: true };
        }
        return list;
      })
    );

    goalLists = updatedGoalLists;
    await goalListsQuery.refetch();
    refetch();
  };

  return (
    <div className="container mx-auto pl-0 p-3">
      <h1 className="text-xl font-bold mb-5">
        Turn your goal list into lasting habits
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {!goalListsQuery.isPending
          ? goalLists!.map((list) => (
              <Card
                key={list.uuid}
                className="flex flex-col min-w-[20vw]  border border-b-zinc-800 hover:border-slate-200"
              >
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-base">{list.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-2 flex-grow">
                  <ul className="text-sm space-y-1">
                    {list.goals!.map((goal) => (
                      <li key={goal.uuid} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{goal.title}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="p-2">
                  <Button
                    variant={list.subscribed ? "secondary" : "default"}
                    className="w-full text-xs py-1"
                    onClick={() => toggleSubscription(list.uuid)}
                  >
                    {list.subscribed ? (
                      <>
                        <CheckIcon className="mr-1 h-5 w-4" />
                        Subscribed
                      </>
                    ) : (
                      "Subscribe"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))
          : "Loading..."}
      </div>
    </div>
  );
};

export default function Index() {
  const totalGoalsQuery = useQuery({
    queryKey: ["get-total-goals"],
    queryFn: getTotalGoals,
  });

  if (totalGoalsQuery.error)
    return "An error has occurred: " + totalGoalsQuery.error.message;

  return (
    <>
      <Card className="w-96 m-auto">
        <CardHeader>
          <CardTitle>Total Goals</CardTitle>
          <CardDescription>The total amount of goals</CardDescription>
        </CardHeader>
        <CardContent>
          {totalGoalsQuery.isPending
            ? "..."
            : totalGoalsQuery.data.result!.total}
        </CardContent>
      </Card>
      <SubscribeGoalLists refetch={() => {}} />
    </>
  );
}
