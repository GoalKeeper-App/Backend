import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Plus } from "lucide-react";
import { useMediaQuery } from "usehooks-ts";
import { GoalEntity, GoalList } from "@server/sharedTypes";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { v4 } from "uuid";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import EditGoalItem from "./edit-goal-item";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

type EditGoalListProps = {
  goalList: GoalList;
  onSave: (goalList: GoalList) => void;
  onDelete: (goalListUuid: string) => void;
};

export function EditGoalList({
  goalList,
  onSave,
  onDelete,
}: EditGoalListProps) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const content = (
    <ProfileForm
      goalList={goalList}
      onSave={(goalList) => {
        onSave(goalList);
        setOpen(false);
      }}
      onDelete={(goalListUuid) => {
        onDelete(goalListUuid);
        setOpen(false);
      }}
    />
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute -top-2 -right-2 border 
                border-gray-400 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-900 
                rounded-full w-12 h-12"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Goal-List anpassen</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-2 -right-1 border 
                border-gray-400 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-900 
                rounded-full w-12 h-12"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Goal-List anpassen</DrawerTitle>
        </DrawerHeader>
        {React.cloneElement(content, { className: "px-4" })}
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Abbrechen</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

type ProfileFormProps = {
  goalList: GoalList;
  className?: string;
  onSave: (goalList: GoalList) => void;
  onDelete: (goalListUuid: string) => void;
};

function ProfileForm({
  goalList,
  className,
  onSave,
  onDelete,
}: ProfileFormProps) {
  const [title, setTitle] = React.useState(goalList.title);
  const [goals, setGoals] = React.useState(
    goalList.goals.sort((goal1, goal2) => goal1.index - goal2.index)
  );

  const handleAddGoal = () => {
    const newGoal: GoalEntity = {
      uuid: v4(),
      title: "",
      completed: false,
      streak: 0,
      contributers: [],
      createdAt: Date.now().toString(),
      index: ((
        goals.sort((goal1, goal2) => goal1.index - goal2.index)[
          goals.length - 1
        ] ?? { index: 0 }
      ).index += 1),
    };

    setGoals([...goals, newGoal]);
  };

  const handleRemoveGoal = (goalUuid: string) => {
    setGoals((prevGoals) => {
      const updatedGoals = prevGoals.filter((goal) => goal.uuid !== goalUuid);
      const sortedGoals = updatedGoals.sort((a, b) => a.index - b.index);

      return sortedGoals.map((goal, newIndex) => ({
        ...goal,
        index: newIndex, // Setzt den neuen Index, beginnend mit 0
      }));
    });
  };

  const handleGoalTitleChange = (goalUuid: string, newTitle: string) => {
    setGoals(
      goals.map((goal) =>
        goal.uuid === goalUuid ? { ...goal, title: newTitle } : goal
      )
    );
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over === null) return;

    if (active.id !== over.id) {
      setGoals((goals) => {
        const oldIndex = goals.findIndex(
          (goal) => goal.uuid === active.id.toString()
        );
        const newIndex = goals.findIndex(
          (goal) => goal.uuid === over.id.toString()
        );

        // Move the goals and update their indices
        const updatedGoals = arrayMove(goals, oldIndex, newIndex).map(
          (goal, index) => ({
            ...goal,
            index: index, // Update the index attribute of each goal based on the new order
          })
        );

        return updatedGoals;
      });
    }
  }

  return (
    <>
      <form
        className={cn("grid items-start gap-4", className)}
        onSubmit={(e) => {
          e.preventDefault();
          goalList.goals = goals;
          goalList.title = title;
          onSave(goalList);
        }}
      >
        <div className="flex">
          <Label htmlFor="title" className="m-auto mr-3">Titel</Label>
          <Input
            type="text"
            id="title"
            placeholder="Goal-List Titel"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <Separator />
        <div className="flex justify-between items-center">
          <Label>Goals</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddGoal}
          >
            <Plus className="h-4 w-4 mr-2" /> Goal hinzufügen
          </Button>
        </div>
        <DndContext
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={goals.map((goal) => goal.uuid)}>
            <div className="min-h-[calc(8vh)] max-h-[calc(40vh)] overflow-auto scroll-m-1 pr-3 -mr-4">
              {goals.map((goal) => {
                return (
                  <EditGoalItem
                    key={goal.uuid}
                    handleGoalTitleChange={handleGoalTitleChange}
                    handleRemoveGoal={handleRemoveGoal}
                    goal={goal}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
        <div className="flex justify-between">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Liste löschen</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sind Sie sich sicher?</AlertDialogTitle>
                <AlertDialogDescription>
                  Das Löschen der Liste ist unumkehrbar. Dieser Schritt wird die Goal-Liste und alle Goals löschen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete(goalList.uuid);
                  }}
                >
                  Löschen
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button type="submit">Änderungen speichern</Button>
        </div>
      </form>
    </>
  );
}
