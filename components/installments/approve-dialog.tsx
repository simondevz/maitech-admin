"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ApproveDialog({
  trigger,
  onApprove,
}: {
  trigger: React.ReactNode;
  onApprove: (details: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      await onApprove(details.trim());
      setOpen(false);
      setDetails("");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Approve application</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="Additional details (optional) — included in the approval email to the customer"
            rows={4}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
          <DialogFooter>
            <Button type="submit" loading={pending}>
              Approve application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
