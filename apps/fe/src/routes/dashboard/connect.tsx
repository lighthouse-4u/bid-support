import { createFileRoute } from "@tanstack/react-router";
import { Box, Button, Field, Input } from "@chakra-ui/react";
import { useAuth } from "@/lib/auth-context";
import { useRef, useState } from "react";

export const Route = createFileRoute("/dashboard/connect")({
  component: ConnectPage,
});

function ConnectPage() {
  const { token } = useAuth();
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function copyToken() {
    if (!token) return;
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Box maxW="lg">
      <Field.Root>
        <Field.Label>Extension token</Field.Label>
        <Field.HelperText>
          Copy this token, then click the Bidding Bot extension icon and paste it in the popup to connect.
        </Field.HelperText>
        <Box display="flex" gap="2" mt="2">
          <Input ref={inputRef} type="password" value={token ?? ""} readOnly />
          <Button onClick={copyToken}>{copied ? "Copied" : "Copy token"}</Button>
        </Box>
      </Field.Root>
    </Box>
  );
}
