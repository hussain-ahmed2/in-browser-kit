"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { InputField } from "@/components/form/input-field";
import { Loader2, Save, FileText } from "lucide-react";

export const metadataSchema = z.object({
  title: z.string().optional(),
  author: z.string().optional(),
  subject: z.string().optional(),
  keywords: z.string().optional(),
  creator: z.string().optional(),
  producer: z.string().optional(),
});

export type MetadataFormValues = z.infer<typeof metadataSchema>;

interface MetadataFormProps {
  defaultValues: MetadataFormValues;
  onSubmit: (values: MetadataFormValues) => void;
  isProcessing: boolean;
  isExtracting: boolean;
}

export function MetadataForm({
  defaultValues,
  onSubmit,
  isProcessing,
  isExtracting,
}: MetadataFormProps) {
  const form = useForm<MetadataFormValues>({
    resolver: zodResolver(metadataSchema),
    defaultValues,
  });

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full lg:w-[320px] shrink-0 space-y-6 bg-card border border-border rounded-xl p-5 shadow-sm">
        <h3 className="font-medium mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4" /> Metadata Properties
        </h3>

        <FieldGroup>
          <InputField
            name="title"
            label="Title"
            placeholder="e.g. Project Proposal"
          />
          <InputField
            name="author"
            label="Author"
            placeholder="e.g. John Doe"
          />
          <InputField
            name="subject"
            label="Subject"
            placeholder="e.g. Q3 Report"
          />
          <InputField
            name="keywords"
            label="Keywords (comma separated)"
            placeholder="e.g. finance, 2026"
          />
          <InputField
            name="creator"
            label="Creator"
            placeholder="e.g. Microsoft Word"
          />
          <InputField
            name="producer"
            label="Producer"
            placeholder="e.g. macOS Version 14"
          />
        </FieldGroup>

        <div className="pt-6 border-t border-border">
          <Button
            type="submit"
            disabled={isProcessing || isExtracting}
            className="w-full bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
          >
            {isProcessing ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Saving...
              </>
            ) : (
              <>
                <Save aria-hidden="true" data-icon="inline-start" />
                Save PDF
              </>
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
