import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
//import { TanStackRouterDevtools } from "@tanstack/router-devtools";

export const Route = createRootRoute({
  component: Root,
});

function NavBar() {
  return (
    <div className="p-2 flex gap-2">
      <Link to="/" className="[&.active]:font-bold">
        Home
      </Link>{" "}
      <Link to="/about" className="[&.active]:font-bold">
        About
      </Link>
      <Link to="/goals" className="[&.active]:font-bold">
        Goals
      </Link>
      <Link to="/create-goal" className="[&.active]:font-bold">
        Create Goal
      </Link>
    </div>
  );
}

function Root() {
  return (
    <>
      <NavBar />
      <hr />
      <Outlet />
      {/*<TanStackRouterDevtools />*/}
    </>
  );
}
