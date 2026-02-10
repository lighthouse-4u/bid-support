import { Link, useRouterState } from '@tanstack/react-router'

import { useState } from 'react'
import {
  Box,
  Drawer,
  Flex,
  HStack,
  IconButton,
  Text,
} from '@chakra-ui/react'
import { Gavel, Home, LayoutDashboard, LogIn, Menu, UserPlus, X } from 'lucide-react'

import { useAuth } from '@/lib/auth-context'

const navLinkProps = {
  p: 3,
  rounded: 'lg',
  _hover: { bg: 'gray.700' },
  transition: 'colors',
  mb: 2,
} as const

const activeLinkProps = {
  ...navLinkProps,
  bg: 'cyan.600',
  _hover: { bg: 'cyan.700' },
} as const

function NavLink({
  to,
  icon: Icon,
  label,
  onClose,
}: {
  to: string
  icon: React.ComponentType<{ size?: number }>
  label: string
  onClose: () => void
}) {
  const routerState = useRouterState()
  const isActive = routerState.location.pathname === to
  return (
    <Link to={to} onClick={onClose}>
      <HStack gap={3} {...(isActive ? activeLinkProps : navLinkProps)}>
        <Icon size={20} />
        <Text fontWeight="medium">{label}</Text>
      </HStack>
    </Link>
  )
}

export default function Header() {
  const [open, setOpen] = useState(false)
  const { token } = useAuth()

  return (
    <>
      <Box
        as="header"
        p={4}
        display="flex"
        alignItems="center"
        bg="gray.800"
        color="white"
        shadow="lg"
      >
        <Drawer.Root
          open={open}
          onOpenChange={({ open: o }) => setOpen(o)}
          placement="start"
          size="sm"
        >
          <Drawer.Trigger asChild>
            <IconButton
              aria-label="Open menu"
              variant="ghost"
              colorPalette="gray"
              _hover={{ bg: 'gray.700' }}
            >
              <Menu size={24} color="white" />
            </IconButton>
          </Drawer.Trigger>
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content bg="gray.900" color="white" shadow="2xl">
              <Flex
                alignItems="center"
                justifyContent="space-between"
                p={4}
                borderBottomWidth="1px"
                borderColor="gray.700"
              >
                <Drawer.Title asChild>
                  <Text fontSize="xl" fontWeight="bold">
                    Navigation
                  </Text>
                </Drawer.Title>
                <Drawer.CloseTrigger asChild>
                  <IconButton
                    aria-label="Close menu"
                    variant="ghost"
                    colorPalette="gray"
                    _hover={{ bg: 'gray.800' }}
                  >
                    <X size={24} color="white" />
                  </IconButton>
                </Drawer.CloseTrigger>
              </Flex>
              <Drawer.Body flex={1} p={4} overflowY="auto">
                <NavLink to="/" icon={Home} label="Home" onClose={() => setOpen(false)} />
                {token ? (
                  <NavLink
                    to="/dashboard"
                    icon={LayoutDashboard}
                    label="Dashboard"
                    onClose={() => setOpen(false)}
                  />
                ) : (
                  <>
                    <NavLink
                      to="/sign-in"
                      icon={LogIn}
                      label="Sign in"
                      onClose={() => setOpen(false)}
                    />
                    <NavLink
                      to="/sign-up"
                      icon={UserPlus}
                      label="Sign up"
                      onClose={() => setOpen(false)}
                    />
                  </>
                )}
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Drawer.Root>
        <Link to="/">
          <HStack gap={2} ml={4}>
            <Gavel size={24} />
            <Text as="span" fontSize="xl" fontWeight="semibold">
              Bidding Bot
            </Text>
          </HStack>
        </Link>
      </Box>
    </>
  )
}
