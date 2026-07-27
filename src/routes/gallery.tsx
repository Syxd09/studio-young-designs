import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/gallery")({
  component: () => <Navigate to="/portfolio" replace />,
});
