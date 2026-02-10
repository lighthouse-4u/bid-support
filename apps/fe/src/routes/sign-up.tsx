import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Field, Input, VStack } from "@chakra-ui/react";
import { useAuth } from "@/lib/auth-context";
import { authApi } from "@/lib/api";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "At least 8 characters"),
});

type Form = z.infer<typeof schema>;

export const Route = createFileRoute("/sign-up")({
  component: SignUpPage,
});

function SignUpPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const { register, handleSubmit, setError, formState } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: Form) {
    try {
      const { token, user } = await authApi.signUp(data.email, data.password);
      setAuth(token, user);
      navigate({ to: "/dashboard" });
    } catch (e) {
      setError("root", { message: e instanceof Error ? e.message : "Sign up failed" });
    }
  }

  return (
    <Box maxW="md" mx="auto" mt="8" p="6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack gap="4" align="stretch">
          <Field.Root>
            <Field.Label>Email</Field.Label>
            <Input type="email" {...register("email")} />
            {formState.errors.email && (
              <Field.ErrorText>{formState.errors.email.message}</Field.ErrorText>
            )}
          </Field.Root>
          <Field.Root>
            <Field.Label>Password</Field.Label>
            <Input type="password" {...register("password")} />
            {formState.errors.password && (
              <Field.ErrorText>{formState.errors.password.message}</Field.ErrorText>
            )}
          </Field.Root>
          {formState.errors.root && (
            <Box color="red.500">{formState.errors.root.message}</Box>
          )}
          <Button type="submit" loading={formState.isSubmitting}>
            Sign up
          </Button>
        </VStack>
      </form>
    </Box>
  );
}
