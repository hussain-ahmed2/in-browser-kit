import type { HTMLInputTypeAttribute } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

interface InputFieldProps {
  name: string;
  label: string;
  description?: string;
  type?: HTMLInputTypeAttribute;
  placeholder?: string;
  step?: number | string;
}

export function InputField({
  name,
  label,
  description,
  type = "text",
  placeholder,
  step,
}: InputFieldProps) {
  const form = useFormContext();

  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Input
            {...field}
            type={type}
            id={field.name}
            aria-invalid={fieldState.invalid}
            placeholder={placeholder}
            autoComplete="off"
            step={step}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
