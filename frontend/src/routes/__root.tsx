import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { userQueryOptions } from "@/lib/api";

//import { userQueryOptions } from "@/lib/api";
import { type QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  Link,
  Outlet,
} from "@tanstack/react-router";
//import { TanStackRouterDevtools } from "@tanstack/router-devtools";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async ({ context }) => {
    const queryClient = context.queryClient;
    try {
      const data = await queryClient.fetchQuery(userQueryOptions);
      return data;
    } catch (e) {
      return { user: null };
    }
  },
  component: Root,
});

function NavBar() {
  //const { isPending, data, error } = {isPending: false, data: null, error: false}//useQuery(userQueryOptions);
  const { user } = Route.useRouteContext();
  const error = user === null;

  return (
    <div className="p-1 flex justify-between max-w-2xl m-auto">
      <div className="flex align-text-bottom">
        <Link to="/" className="[&.active]:font-bold m-1 p-2">
          Home
        </Link>{" "}
        <Link to="/about" className="[&.active]:font-bold m-1 p-2">
          About
        </Link>
        <Link to="/goals" className="[&.active]:font-bold m-1 p-2">
          Goals
        </Link>
        {/*<Link to="/create-goal" className="[&.active]:font-bold m-1 p-2">
          Create Goal
        </Link>*/}
        <Link to="/profile" className="[&.active]:font-bold m-1 p-2">
          Profile
        </Link>
      </div>
      <div className="m-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="">
              <Avatar>
                <AvatarImage src="" alt="Profil Picture" />
                <AvatarFallback>
                  {error ? "?" : user?.given_name[0] + user?.family_name[0]}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            {user ? (
              <>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.given_name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email ? user?.email : user.family_name}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
              </>
            ) : (
              <></>
            )}
            {/*
                <DropdownMenuGroup>
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Billing</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>New Team</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
              */}
            <DropdownMenuItem asChild>
              <a href={error ? "/api/login" : "/api/logout"}>
                {error ? "Log in" : "Log out"}
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function Root() {
  return (
    <>
      <NavBar />
      <hr />
      <div className="p-2 gap-2 max-w-2xl m-auto">
        <Outlet />
      </div>
      {/*<TanStackRouterDevtools />*/}
    </>
  );
}
