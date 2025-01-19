import { useSortable } from "@dnd-kit/sortable";
import { GoalEntity } from "@server/sharedTypes";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { GripVertical, Trash2 } from "lucide-react";

type EditGoalItemProps = {
  goal: GoalEntity;
  handleRemoveGoal: (goalUuid: string) => void;
  handleGoalTitleChange: (goalUuid: string, newTitle: string) => void;
};

export default function EditGoalItem({
  goal,
  handleRemoveGoal,
  handleGoalTitleChange,
}: EditGoalItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: goal.uuid });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-center space-x-2 rounded-md m-1">
        <div {...listeners} {...attributes} className="cursor-move">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <Input
          value={goal.title}
          onChange={(e) => handleGoalTitleChange(goal.uuid, e.target.value)}
          placeholder="Goal title"
          className="flex-grow"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => handleRemoveGoal(goal.uuid)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
