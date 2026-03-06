"use client";

import { useTheme } from "next-themes";
import { SignOutIcon, UserIcon, PaletteIcon, SunIcon, MoonIcon, MonitorIcon } from "@phosphor-icons/react";
import { Avatar, AvatarFallback } from "@merge/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@merge/ui/components/dropdown-menu";
import { useAuth } from "../hooks/use-auth";
import { useUser } from "../hooks/use-user";

export function UserProfile() {
  const { user } = useUser();
  const { signOut, accountManagement } = useAuth();
  const { theme, setTheme } = useTheme();

  const initials = user.firstName?.[0] ?? user.fullName?.[0] ?? "?";

  const onThemeChange = (value: string) => {
    if (typeof window !== "undefined" && document.startViewTransition) {
      document.startViewTransition(() => setTheme(value));
    } else {
      setTheme(value);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="cursor-pointer">
          <Avatar size="sm">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user.fullName}</p>
          <p className="text-xs text-neutral-500">{user.primaryEmailAddress?.emailAddress}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={accountManagement}>
          <UserIcon className="mr-2 size-4" />
          Manage account
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <PaletteIcon className="mr-2 size-4" />
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuLabel>Appearance</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={theme ?? "system"} onValueChange={onThemeChange}>
                <DropdownMenuRadioItem value="light">
                  <SunIcon className="mr-2 size-4" />
                  Light
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">
                  <MoonIcon className="mr-2 size-4" />
                  Dark
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">
                  <MonitorIcon className="mr-2 size-4" />
                  System
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ redirectTo: "home" })}>
          <SignOutIcon className="mr-2 size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
