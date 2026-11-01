import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";
import { AppRoot, AccountPage, AddFlightPage, CreateItineraryPage, ExplorePage, HomePage, IndexPage, ItineraryPage, LoginPage, RegisterPage, RundownFilterPage, RundownPage } from "./refactored-app";

const rootRoute = createRootRoute({ component: AppRoot });
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: IndexPage });
const onboardingRoute = createRoute({ getParentRoute: () => rootRoute, path: "/onboarding/$step", component: RegisterPage });
const loginRoute = createRoute({ getParentRoute: () => rootRoute, path: "/login/$step", component: LoginPage });
const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: "/home", component: HomePage });
const exploreRoute = createRoute({ getParentRoute: () => rootRoute, path: "/explore", component: ExplorePage });
const itineraryRoute = createRoute({ getParentRoute: () => rootRoute, path: "/itinerary", component: ItineraryPage });
const createItineraryRoute = createRoute({ getParentRoute: () => rootRoute, path: "/itinerary/create/$step", component: CreateItineraryPage });
const addFlightRoute = createRoute({ getParentRoute: () => rootRoute, path: "/itinerary/flight/$step", component: AddFlightPage });
const rundownRoute = createRoute({ getParentRoute: () => rootRoute, path: "/itinerary/rundown", component: RundownPage });
const rundownFilterRoute = createRoute({ getParentRoute: () => rootRoute, path: "/itinerary/rundown/$filter", component: RundownFilterPage });
const accountRoute = createRoute({ getParentRoute: () => rootRoute, path: "/account", component: AccountPage });

const routeTree = rootRoute.addChildren([
  indexRoute,
  onboardingRoute,
  loginRoute,
  homeRoute,
  exploreRoute,
  itineraryRoute,
  createItineraryRoute,
  addFlightRoute,
  rundownRoute,
  rundownFilterRoute,
  accountRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
