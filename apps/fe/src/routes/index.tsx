import { createFileRoute, Link } from '@tanstack/react-router'
import { Box, HStack, Text } from '@chakra-ui/react'
import { useAuth } from '@/lib/auth-context'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const { token } = useAuth()
  return (
    <Box p="8" maxW="xl" mx="auto" textAlign="center">
      <Text fontSize="2xl" fontWeight="bold" mb="6">
        Bidding Bot
      </Text>
      <HStack gap="4" justify="center" flexWrap="wrap">
        {token ? (
          <Link to="/dashboard">Dashboard</Link>
        ) : (
          <>
            <Link to="/sign-in">Sign in</Link>
            <Link to="/sign-up">Sign up</Link>
          </>
        )}
      </HStack>
    </Box>
  )
}
