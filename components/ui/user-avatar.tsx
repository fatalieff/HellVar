"use client";

import { cn } from "@/lib/utils";
import { getAvatarPublicUrl } from "@/lib/supabase/avatar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type UserAvatarProps = {
  avatarUrl?: string | null;
  name?: string | null;
  className?: string;
  fallbackClassName?: string;
};

export function UserAvatar({
  avatarUrl,
  name,
  className,
  fallbackClassName,
}: UserAvatarProps) {
  const url = getAvatarPublicUrl(avatarUrl);
  const initials =
    (name || "?")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?";

  return (
    <Avatar className={cn("size-10 shrink-0", className)}>
      {url ? <AvatarImage src={url} alt={name || "Avatar"} /> : null}
      <AvatarFallback className={cn("font-bold", fallbackClassName)}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
