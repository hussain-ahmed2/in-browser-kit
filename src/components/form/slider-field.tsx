import { Controller, useFormContext } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "../ui/field";
import { Slider } from "../ui/slider";

interface SliderFieldProps {
  name: string;
  label: string;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  formatValue?: (val: number) => string;
}

export function SliderField({
  name,
  label,
  description,
  min = 0,
  max = 100,
  step = 1,
  formatValue,
}: SliderFieldProps) {
  const form = useFormContext();

  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <div className="flex justify-between items-center w-full">
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            {formatValue && field.value !== undefined && (
              <span className="text-sm text-muted-foreground font-medium">
                {formatValue(Array.isArray(field.value) ? field.value[0] : field.value)}
              </span>
            )}
          </div>
          <Slider
            id={field.name}
            min={min}
            max={max}
            step={step}
            value={Array.isArray(field.value) ? field.value : [field.value]}
            onValueChange={(vals) => field.onChange(vals[0])}
            className="w-full py-2"
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
}
