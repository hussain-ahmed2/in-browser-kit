import { Controller, useFormContext } from "react-hook-form";
import { Checkbox } from "../ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "../ui/field";

interface CheckboxFieldProps {
  name: string;
  label: string;
  description?: string;
}

export function CheckboxField({
  name,
  label,
  description,
}: CheckboxFieldProps) {
  const form = useFormContext();

  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field orientation="horizontal" data-invalid={fieldState.invalid}>
          <Checkbox
            id={field.name}
            checked={field.value}
            onCheckedChange={field.onChange}
            aria-invalid={fieldState.invalid}
          />
          {description ? (
            <FieldContent>
              <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
              <FieldDescription>{description}</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldContent>
          ) : (
            <>
              <FieldLabel htmlFor={field.name} className="font-normal">
                {label}
              </FieldLabel>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </>
          )}
        </Field>
      )}
    />
  );
}
