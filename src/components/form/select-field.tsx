import { Controller, useFormContext } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  name: string;
  label: string;
  options: SelectOption[];
  description?: string;
  placeholder?: string;
  /**
   * Optional side-effect callback fired after the RHF field value is updated.
   * Use this for dependent field logic (e.g. auto-filling a related field)
   * without having to drop down to a raw <Controller>.
   */
  onValueChange?: (value: string) => void;
}

export function SelectField({
  name,
  label,
  options,
  description,
  placeholder = "Select an option",
  onValueChange,
}: SelectFieldProps) {
  const form = useFormContext();

  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <Select
            value={field.value}
            onValueChange={(val) => {
              field.onChange(val);
              onValueChange?.(val);
            }}
          >
            <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
