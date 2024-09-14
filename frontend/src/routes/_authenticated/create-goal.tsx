import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "@tanstack/react-form";
import { api } from "@/lib/api";
import { zodValidator } from "@tanstack/zod-form-adapter";
//import { createGoalSchema } from "@server/sharedTypes";

export const Route = createFileRoute("/_authenticated/create-goal")({
  component: CreateGoal,
});

function CreateGoal() {
  const navigate = useNavigate();

  const form = useForm({
    validatorAdapter: zodValidator(),
    defaultValues: {
      title: "",
    },
    onSubmit: async ({ value }) => {
      //const res = await api.goals.$post({ json: value });
      //if (!res.ok) throw new Error("Server Error");
      //navigate({ to: "/goals" });
    },
  });

  return (
    <div className="p-2">
      <h2>Create Goal</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-y-4 max-w-xl m-auto"
      >
        <div>
          <form.Field
            name="title"
            validators={{ onChange: () => ("") }}//createGoalSchema.shape.title }}
            children={(field) => {
              return (
                <div>
                  <Label htmlFor={field.name}>Title</Label>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Title of the goal"
                  />
                  {field.state.meta.isTouched &&
                  field.state.meta.errors.length ? (
                    <em>{field.state.meta.errors.join(", ")}</em>
                  ) : null}
                </div>
              );
            }}
          />
        </div>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <Button className="mt-4" type="submit" disabled={!canSubmit}>
              {isSubmitting ? "..." : "Create Goal"}
            </Button>
          )}
        />
      </form>
    </div>
  );
}
