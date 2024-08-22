import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function App() {
  const [totalGoal, setTotalGoal] = useState(0);

  return (
    <Card className="w-[350px] m-auto">
      <CardHeader>
        <CardTitle>Total Goals</CardTitle>
        <CardDescription>The total amount of goals</CardDescription>
      </CardHeader>
      <CardContent>{totalGoal}</CardContent>
    </Card>
  );
}

export default App;
