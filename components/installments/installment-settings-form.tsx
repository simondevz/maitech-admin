"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import type { InstallmentSettings } from "@/lib/backend/types";
import { useUpdateInstallmentSettings } from "@/hooks/queries/useInstallments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const settingsSchema = z.object({
  maritech_max_slots: z.coerce.number().min(0),
  maritech_max_months: z.coerce.number().min(1),
  maritech_upfront_pct: z.coerce.number().min(0).max(100),
  maritech_monthly_rate: z.coerce.number().min(0),
  doc_fee: z.coerce.number().min(0),
  mgmt_fee_pct: z.coerce.number().min(0).max(100),
  partner_email: z.string().email("Enter a valid email"),
  auto_forward_partner: z.boolean(),
});

export function InstallmentSettingsForm({ settings }: { settings: InstallmentSettings }) {
  const updateSettings = useUpdateInstallmentSettings();

  const form = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      maritech_max_slots: settings.maritech_max_slots,
      maritech_max_months: settings.maritech_max_months,
      maritech_upfront_pct: settings.maritech_upfront_pct,
      maritech_monthly_rate: settings.maritech_monthly_rate,
      doc_fee: settings.doc_fee,
      mgmt_fee_pct: settings.mgmt_fee_pct,
      partner_email: settings.partner_email,
      auto_forward_partner: settings.auto_forward_partner,
    },
  });

  async function onSubmit(values: z.output<typeof settingsSchema>) {
    try {
      await updateSettings.mutateAsync(values);
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="maritech_max_slots"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max slots</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value as number} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maritech_max_months"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max months</FormLabel>
                <FormControl>
                  <Input type="number" {...field} value={field.value as number} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maritech_upfront_pct"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Upfront %</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} value={field.value as number} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maritech_monthly_rate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Monthly rate</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} value={field.value as number} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="doc_fee"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document fee (₦)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} value={field.value as number} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mgmt_fee_pct"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Management fee %</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} value={field.value as number} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="partner_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Partner email</FormLabel>
              <FormControl>
                <Input type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="auto_forward_partner"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center gap-2">
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="!mt-0">Auto-forward to partner when full</FormLabel>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={form.formState.isSubmitting}>
          Save settings
        </Button>
      </form>
    </Form>
  );
}
