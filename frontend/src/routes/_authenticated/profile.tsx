import { createFileRoute, Link } from "@tanstack/react-router";
import { api, userQueryOptions } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/profile")({
  component: Profile,
});

function Profile() {
  const { isPending, data, error } = useQuery(userQueryOptions);

  if (isPending) return "loading";
  if (error) return "not logged in";

  return (
    <div>
      <p>Hello {data.user.given_name}!</p>
      <a href="/api/logout">Logout</a>
    </div>
  );
}
