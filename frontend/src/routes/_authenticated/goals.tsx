import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  //TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/goals")({
  component: Goals,
});

async function getAllGoals() {
  const result = await api.goals.$get();
  if (!result.ok) throw new Error("Server error");
  const data = await result.json();
  return data;
}

function Goals() {
  const { isPending, data, error } = useQuery({
    queryKey: ["get-all-goals"],
    queryFn: getAllGoals,
  });

  if (error) return <div>An error has occurred: {error.message}</div>;

  return (
    <div className="p-2 max-w-3xl m-auto">
      <Table>
        <TableCaption>A list of all your goals.</TableCaption>
        <TableHeader>
          <TableRow key="header">
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
                .map((_, j) => (
                  <TableRow key={`skeleton-${j}`}>
                    {Array(4)
                      .fill(0)
                      .map((_, i) => (
                        <TableCell key={`skeleton-cell-${j}-${i}`}>
                          <Skeleton className="h-4" />
                        </TableCell>
                      ))}
                  </TableRow>
                ))
            : data?.goals.map((goal) => (
                <TableRow key={goal.uuid}>
                  <TableCell key={`${goal.uuid}-title`} className="font-medium">
                    {goal.title}
                  </TableCell>
                  <TableCell key={`${goal.uuid}-completed_by`}>
                    {goal.completed_by?.join(", ")}
                  </TableCell>
                  <TableCell key={`${goal.uuid}-streak`}>
                    {goal.streak}
                  </TableCell>
                  <TableCell
                    key={`${goal.uuid}-completed`}
                    className="text-2xl"
                  >
                    {goal.completed ? "✅" : "❌"}
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  );
}
