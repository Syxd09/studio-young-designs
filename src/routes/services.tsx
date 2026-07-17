/**
 * Services layout route — provides <Outlet /> for nested /services/* routes.
 */

import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/services")({
  component: () => <Outlet />,
});
