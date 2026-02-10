import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Box, Button, HStack } from "@chakra-ui/react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) throw redirect({ to: "/sign-in" });
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  const { user, signOut } = useAuth();
  return (
    <Box p="4">
      <HStack justify="space-between" mb="6">
        <HStack gap="4">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/dashboard/prompts">Prompts</Link>
          <Link to="/dashboard/connect">Connect extension</Link>
        </HStack>
        <HStack>
          <Box>{user?.email}</Box>
          <Button size="sm" onClick={signOut}>Sign out</Button>
        </HStack>
      </HStack>
      <Outlet />
    </Box>
  );
}
