import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Box, Button, Field, HStack, Input, Table, Textarea, VStack } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { promptsApi, type Prompt } from "@/lib/api";
import { useState } from "react";

const schema = z.object({
  keyword: z.string().min(1).regex(/^\w+$/, "Letters, numbers, underscore only"),
  body: z.string().min(1),
});

type Form = z.infer<typeof schema>;

export const Route = createFileRoute("/dashboard/prompts")({
  component: PromptsPage,
});

function PromptsPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const { data: prompts = [], isLoading } = useQuery({
    queryKey: ["prompts"],
    queryFn: () => promptsApi.list(),
  });
  const createMutation = useMutation({
    mutationFn: (d: Form) => promptsApi.create(d.keyword, d.body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      reset();
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }: { id: string } & Form) =>
      promptsApi.update(id, { keyword: d.keyword, body: d.body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["prompts"] });
      setEditingId(null);
      reset();
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => promptsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["prompts"] }),
  });
  const { register, handleSubmit, reset, setValue, formState } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { keyword: "", body: "" },
  });

  function startEdit(p: Prompt) {
    setEditingId(p.id);
    setValue("keyword", p.keyword);
    setValue("body", p.body);
  }

  function onFormSubmit(data: Form) {
    if (editingId) updateMutation.mutate({ id: editingId, ...data });
    else createMutation.mutate(data);
  }

  if (isLoading) return <Box>Loading...</Box>;

  return (
    <VStack align="stretch" gap="6">
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <VStack gap="4" align="stretch" maxW="lg">
          <Field.Root>
            <Field.Label>Keyword (e.g. freelancer)</Field.Label>
            <Input placeholder="freelancer" {...register("keyword")} />
            <Field.HelperText>Use @keyword in the extension (e.g. @freelancer)</Field.HelperText>
            {formState.errors.keyword && (
              <Field.ErrorText>{formState.errors.keyword.message}</Field.ErrorText>
            )}
          </Field.Root>
          <Field.Root>
            <Field.Label>Prompt body (use {"{{copied_text}}"})</Field.Label>
            <Textarea rows={4} placeholder="Write a bid for: {{copied_text}}" {...register("body")} />
            {formState.errors.body && (
              <Field.ErrorText>{formState.errors.body.message}</Field.ErrorText>
            )}
          </Field.Root>
          <HStack>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {editingId ? "Update" : "Create"}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={() => { setEditingId(null); reset(); }}>
                Cancel
              </Button>
            )}
          </HStack>
        </VStack>
      </form>
      <Box overflowX="auto">
        <Table.Root>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Keyword</Table.ColumnHeader>
              <Table.ColumnHeader>Body (snippet)</Table.ColumnHeader>
              <Table.ColumnHeader>Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {prompts.map((p) => (
              <Table.Row key={p.id}>
                <Table.Cell>@{p.keyword}</Table.Cell>
                <Table.Cell>{p.body.slice(0, 60)}...</Table.Cell>
                <Table.Cell>
                  <HStack gap="2">
                    <Button size="sm" onClick={() => startEdit(p)}>Edit</Button>
                    <Button size="sm" colorPalette="red" onClick={() => deleteMutation.mutate(p.id)} loading={deleteMutation.isPending}>
                      Delete
                    </Button>
                  </HStack>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </VStack>
  );
}
