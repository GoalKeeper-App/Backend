import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/goals")({
  component: Goals,
});

async function getAllGoals() {
  //await new Promise((r) => setTimeout(r, 3000));
  const result = await api.goals.$get();
  if (!result.ok) throw new Error("server error");
  const data = await result.json();
  return data;
}

function Goals() {
  const { isPending, data, error } = useQuery({
    queryKey: ["get-all-goals"],
    queryFn: getAllGoals,
  });
  if (error) return "An error has occurred: " + error.message;

  return (
    <div className="p-2 max-w-3xl m-auto">
      <Table>
        <TableCaption>A list of all your goals.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Title</TableHead>
            <TableHead>Completed by</TableHead>
            <TableHead>Streak</TableHead>
            <TableHead>Completed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isPending
            ? Array(3)
                .fill(0)
                .map((_, i) => (
                  <TableRow>
                    {Array(4)
                      .fill(0)
                      .map((_, i) => (
                        <TableCell>
                          <Skeleton className="h-4" />
                        </TableCell>
                      ))}
                  </TableRow>
                ))
            : data?.Fitness.map((fit) =>
                fit.fakeGoals.map((goal) => (
                  <TableRow key={goal.title}>
                    <TableCell className="font-medium">{goal.title}</TableCell>
                    <TableCell>{goal.completed_by?.join(", ")}</TableCell>
                    <TableCell>{goal.streak}</TableCell>
                    <TableCell className="text-2xl">
                      {goal.completed ? "✅" : "❌"}
                    </TableCell>
                  </TableRow>
                ))
              )}
        </TableBody>
      </Table>
    </div>
  );
}
