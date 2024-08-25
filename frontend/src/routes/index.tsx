import { createFileRoute } from '@tanstack/react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute('/')({
  component: Index,
})

async function getTotalGoals() {
  const result = await api.goals["total-goals"].$get();
  if (!result.ok) throw new Error("server error");
  const data = await result.json();
  return data;
}

function Index() {
  const { isPending, data, error } = useQuery({
      queryKey: ["get-total-goals"],
      queryFn: getTotalGoals,
    });
    if (error) return "An error has occurred: " + error.message;
  
    return (
      <Card className="w-[350px] m-auto">
        <CardHeader>
          <CardTitle>Total Goals</CardTitle>
          <CardDescription>The total amount of goals</CardDescription>
        </CardHeader>
        <CardContent>{isPending ? "..." : data.total}</CardContent>
      </Card>
    );
}