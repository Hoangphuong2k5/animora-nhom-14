"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Scissors, Stethoscope, User } from "lucide-react";
import { ROUTES } from "@/constants/config.constant";
import { ExpertProfile } from "@/types/expert.type";
import { PortalUserMenu } from "@/components/shared/portal";

interface HeaderUserMenuProps {
  profile: ExpertProfile;
  isVet: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
  onLogout: () => void;
  roleLabel: string;
  profileLabel: string;
  logoutLabel: string;
}

export function HeaderUserMenu({
  profile,
  isVet,
  isOpen,
  onToggle,
  onClose,
  onLogout,
  roleLabel,
  profileLabel,
  logoutLabel,
}: HeaderUserMenuProps) {
  const router = useRouter();

  const initials = profile.fullName
    ? profile.fullName
        .split(" ")
        .filter(Boolean)
        .slice(-2)
        .map((p) => p[0])
        .join("")
        .toUpperCase()
    : "EX";

  const isControlled = isOpen !== undefined;

  return (
    <PortalUserMenu
      name={profile.fullName}
      subtitle={roleLabel}
      subtitleClassName="font-semibold text-primary dark:text-(--coral)"
      menuTitle={profile.fullName}
      menuEmail={profile.email}
      avatarSrc={profile.avatar}
      initials={initials}
      roleBadge={{
        label: roleLabel,
        icon: isVet ? Stethoscope : Scissors,
      }}
      menuItems={[
        {
          label: profileLabel,
          icon: User,
          onClick: () => {
            onClose?.();
            router.push(ROUTES.EXPERT_PROFILE);
          },
        },
      ]}
      logoutLabel={logoutLabel}
      onLogout={() => {
        onClose?.();
        onLogout();
      }}
      open={isControlled ? isOpen : undefined}
      onOpenChange={
        isControlled
          ? (open) => {
              if (open) {
                if (!isOpen) onToggle?.();
              } else {
                onClose?.();
              }
            }
          : undefined
      }
    />
  );
}
