import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/create-goal')({
  component: CreateGoal,
})

function CreateGoal() {
  return <div className="p-2">Hello from CreateGoal!</div>
}