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

async function getArchievedGoals() {
  const result = await api.goals["achieved-goals"].$get();
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
            json: { goalListUuid: list.uuid },
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
    <div className="mx-auto pl-0 p-3">
      <h1 className="text-xl font-bold mb-5">
        Turn your goal list into lasting habits
      </h1>
      {goalLists?.length === 0 ? (
        <p className="text-l font-bold mb-5">
          Keine Goal-List vorhanden. Erstelle eine neue Goal-List!
        </p>
      ) : (
        ""
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {!goalListsQuery.isPending
          ? goalLists!.map((list) => (
              <Card
                key={list.uuid}
                className="flex flex-col border border-b-zinc-800 hover:border-slate-200"
              >
                <CardHeader className="p-3 pb-0">
                  <CardTitle className="text-base">{list.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-2 flex-grow">
                  <ul className="text-sm space-y-1">
                    {list
                      .goals!.sort(
                        (goal1, goal2) =>
                          (goal1?.index ?? 0) - (goal2?.index ?? 0)
                      )
                      .map((goal) => (
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
  const archievedGoalsQuery = useQuery({
    queryKey: ["get-achieved-goals"],
    queryFn: getArchievedGoals,
  });

  if (archievedGoalsQuery.error)
    return "An error has occurred: " + archievedGoalsQuery.error.message;

  return (
    <>
      <Card className="w-auto m-auto">
        <CardHeader>
          <CardTitle>Erreichte Ziele</CardTitle>
          <CardDescription>So oft hast deine Ziele schon erreicht. Weiter so!</CardDescription>
        </CardHeader>
        <CardContent>
          {archievedGoalsQuery.isPending
            ? "..."
            : archievedGoalsQuery.data.result!.total}
        </CardContent>
      </Card>
      <SubscribeGoalLists refetch={() => {}} />
    </>
  );
}
