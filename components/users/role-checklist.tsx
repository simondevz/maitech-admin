"use client";

import type { Role } from "@/lib/backend/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function RoleChecklist({
  roles,
  selected,
  onChange,
}: {
  roles: Role[];
  selected: string[];
  onChange: (slugs: string[]) => void;
}) {
  return (
    <div className="space-y-2">
      {roles.map((role) => {
        const checked = selected.includes(role.slug);
        return (
          <div key={role.id} className="flex items-center gap-2">
            <Checkbox
              id={`role-${role.id}`}
              checked={checked}
              onCheckedChange={(value) =>
                onChange(
                  value
                    ? [...selected, role.slug]
                    : selected.filter((s) => s !== role.slug)
                )
              }
            />
            <Label htmlFor={`role-${role.id}`} className="font-normal">
              {role.name}
            </Label>
          </div>
        );
      })}
    </div>
  );
}
