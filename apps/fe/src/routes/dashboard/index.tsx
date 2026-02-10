import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Field, Input, VStack } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api";

const schema = z.object({
  key: z.string(),
});

type Form = z.infer<typeof schema>;

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { key: "" },
  });
  const mutation = useMutation({
    mutationFn: (key: string) => usersApi.setOpenAiKey(key || null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "me"] });
      reset({ key: "" });
    },
  });

  return (
    <Box maxW="lg">
      <form onSubmit={handleSubmit((d) => mutation.mutate(d.key))}>
        <VStack gap="4" align="stretch">
          <Field.Root>
            <Field.Label>OpenAI API key</Field.Label>
            <Input type="password" placeholder="sk-..." {...register("key")} />
            <Field.HelperText>Stored encrypted. Leave empty to keep current; submit to update or clear.</Field.HelperText>
          </Field.Root>
          <Button type="submit" loading={mutation.isPending}>
            Save key
          </Button>
          {mutation.isError && (
            <Box color="red.500">{mutation.error?.message}</Box>
          )}
        </VStack>
      </form>
    </Box>
  );
}
