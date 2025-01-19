import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { SubscribeGoalLists } from "./index";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GoalList } from "@/components/goal-list";
import { Button } from "@/components/ui/button";
import { Undo } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

export const Route = createFileRoute("/_authenticated/goals")({
  component: GoalTracker,
});

async function getAllGoals(isYesterday: boolean) {
  const result = await api.goals.$get({
    query: {
      isYesterday,
    },
  });
  if (!result.ok) throw new Error("Server error");
  const data = await result.json();
  return data;
}

export default function GoalTracker() {
  const { isPending, data, error, refetch } = useQuery({
    queryKey: ["get-all-goals"],
    queryFn: () => getAllGoals(isYesterday),
  });

  let [isYesterday, setIsYesterday] = useState<boolean>(false);

  if (error) return <div>An error has occurred: {error.message}</div>;

  let [goalLists, setGoalLists] = useState(data?.lists);
  useEffect(() => {
    if (data !== undefined) setGoalLists(data.lists);
  }, [data]);

  useEffect(() => {
    refetch();
  }, [isYesterday]);

  if (data === undefined || goalLists === undefined) {
    return <>Loading...</>;
  }

  async function OnDelete(goalListUuid: string) {
    setGoalLists(goalLists?.filter((list) => list.uuid !== goalListUuid));

    await api.goals["goal-list"][
      ":uuid{[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$}"
    ].$delete({
      param: {
        uuid: goalListUuid,
      },
    });
  }

  return (
    <div className="">
      {goalLists.length === 0 ? (
        <>
          <h1 className="text-xl font-bold">
            No goal lists available. Subscribe to a goal list now!
          </h1>
          <SubscribeGoalLists refetch={refetch} />
        </>
      ) : (
        <>
          <div className="block sm:hidden md:hidden lg:hidden">
            <div className="flex justify-between">
              {/*<Select
                onValueChange={(title) => {
                  setSelectedGoalTitle(title);
                }}
              >
                <SelectTrigger className="mr-1">
                  <SelectValue placeholder="Wähle eine Goal-Liste aus" />
                </SelectTrigger>
                <SelectContent>
                  {goalLists.map((list) => (
                    <SelectItem value={list.title}>{list.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>*/}
              <div></div>
              {/*<Button
                variant={isYesterday ? "default" : "outline"}
                onClick={() => {
                  setIsYesterday(!isYesterday);
                }}
              >
                <Undo />
                <span className="pl-1">Gestern</span>
              </Button>*/}
            </div>
            <div className="">
              <Carousel className="w-auto">
                <CarouselContent>
                  {goalLists.map((list, index) => (
                    <CarouselItem key={index}>
                      <div className="mr-1 p-auto">
                        <GoalList
                          key={list.uuid}
                          goalList={list}
                          user={data.user}
                          refetch={refetch}
                          onDelete={OnDelete}
                        />
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
          <div
            className="hidden mb-3
                        sm:grid md:grid lg:grid grid-cols-0 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 
                        gap-3"
          >
            {goalLists.map((list) => (
              <GoalList
                key={list.uuid}
                goalList={list}
                user={data.user}
                refetch={refetch}
                onDelete={OnDelete}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
