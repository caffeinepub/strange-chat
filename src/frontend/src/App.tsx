import { Toaster } from "@/components/ui/sonner";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ChatRoomPage } from "./pages/ChatRoomPage";
import { CreateRoomPage } from "./pages/CreateRoomPage";
import { FriendsPage } from "./pages/FriendsPage";
import { HomePage } from "./pages/HomePage";
import { JoinRoomPage } from "./pages/JoinRoomPage";
import { ProfilePage } from "./pages/ProfilePage";
import { StrangerPage } from "./pages/StrangerPage";

// ── Routes ────────────────────────────────────────────────────────────────────
const rootRoute = createRootRoute();

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const friendsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/friends",
  component: FriendsPage,
});

const createRoute_ = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create",
  component: CreateRoomPage,
});

const joinRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/join",
  component: JoinRoomPage,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat/$roomCode",
  component: ChatRoomPage,
});

const strangerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/stranger",
  component: StrangerPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  friendsRoute,
  createRoute_,
  joinRoute,
  chatRoute,
  strangerRoute,
  profileRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(10,20,28,0.95)",
            border: "1px solid rgba(57,214,208,0.25)",
            color: "oklch(0.88 0.014 200)",
          },
        }}
      />
    </>
  );
}
