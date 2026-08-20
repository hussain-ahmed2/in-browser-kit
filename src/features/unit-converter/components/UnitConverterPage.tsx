"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { CopyButton } from "@/components/CopyButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeftRight,
  RotateCcw,
  Download,
  LayoutDashboard,
  Scale,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  convertUnit,
  getCategoryUnits,
  getUnitNames,
  type UnitCategory,
} from "../lib/unitConverter";

const CATEGORY_LABELS: Record<UnitCategory, string> = {
  length: "Length",
  weight: "Weight / Mass",
  temperature: "Temperature",
  data: "Data",
  time: "Time",
  area: "Area",
  volume: "Volume",
  speed: "Speed",
};

export function UnitConverterPage() {
  const [category, setCategory] = useState<UnitCategory>("length");
  const [fromUnit, setFromUnit] = useState("");
  const [toUnit, setToUnit] = useState("");
  const [fromValue, setFromValue] = useState("");
  const [toValue, setToValue] = useState("");
  const [precision, setPrecision] = useState(6);
  const [swapDirection, setSwapDirection] = useState(false);

  const units = useMemo(() => getCategoryUnits(category), [category]);
  const unitNames = useMemo(() => getUnitNames(category), [category]);

  // Initialize units when category changes
  useEffect(() => {
    const catUnits = getCategoryUnits(category);
    if (catUnits.length > 0) {
      setTimeout(() => {
        setFromUnit(catUnits[0]);
        setToUnit(catUnits[1] || catUnits[0]);
        setFromValue("");
        setToValue("");
      }, 0);
    }
  }, [category]);

  const convert = useCallback(
    (sourceValue: string, from: string, to: string) => {
      if (!sourceValue || !from || !to) return "";
      const num = parseFloat(sourceValue);
      if (isNaN(num)) return "";
      const result = convertUnit(num, from, to, category);
      if (isNaN(result)) return "";
      return result.toFixed(precision).replace(/\.?0+$/, "");
    },
    [category, precision],
  );

  const handleFromChange = (value: string) => {
    setFromValue(value);
    if (value && fromUnit && toUnit) {
      setToValue(convert(value, fromUnit, toUnit));
    } else {
      setToValue("");
    }
  };

  const handleToChange = (value: string) => {
    setToValue(value);
    if (value && fromUnit && toUnit) {
      setFromValue(convert(value, toUnit, fromUnit));
    } else {
      setFromValue("");
    }
  };

  const handleSwap = () => {
    const newFrom = toUnit;
    const newTo = fromUnit;
    const newFromValue = toValue;
    const newToValue = fromValue;

    setFromUnit(newFrom);
    setToUnit(newTo);
    setFromValue(newFromValue);
    setToValue(newToValue);
    setSwapDirection(!swapDirection);

    // Trigger re-render for animation
    setTimeout(() => setSwapDirection(!swapDirection), 150);
  };

  const handlePrecisionChange = (value: number) => {
    setPrecision(value);
    if (fromValue && fromUnit && toUnit) {
      setToValue(convert(fromValue, fromUnit, toUnit));
    }
  };

  const handleDownload = () => {
    if (fromValue && toValue) {
      const content = `${fromValue} ${unitNames[fromUnit]?.split(" (")[1]?.replace(")", "") || fromUnit} = ${toValue} ${unitNames[toUnit]?.split(" (")[1]?.replace(")", "") || toUnit}\nCategory: ${CATEGORY_LABELS[category]}\nPrecision: ${precision} decimal places`;
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `conversion-${category}-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleClear = () => {
    setFromValue("");
    setToValue("");
  };

  const handleUnitChange = (newFrom: string, newTo: string) => {
    setFromUnit(newFrom);
    setToUnit(newTo);
    if (fromValue) {
      setToValue(convert(fromValue, newFrom, newTo));
    }
  };

  return (
    <Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Unit Converter
        </CardTitle>
        <CardDescription>
          Convert between units of measurement. Runs locally — nothing is
          uploaded.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Selector */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <LayoutDashboard className="h-4 w-4" />
            Category
          </Label>
          <Select
            value={category}
            onValueChange={setCategory as (value: string) => void}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Precision */}
        <div className="space-y-3">
          <Label className="flex items-center justify-between text-sm font-medium">
            Precision
            <span className="text-muted-foreground text-xs">
              {precision} decimals
            </span>
          </Label>
          <input
            type="range"
            min="0"
            max="10"
            value={precision}
            onChange={(e) => handlePrecisionChange(parseInt(e.target.value))}
            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-brand"
          />
        </div>

        {/* Converter */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6">
          {/* From */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              From
            </Label>
            <Select
              value={fromUnit}
              onValueChange={(value) => handleUnitChange(value, toUnit)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unitNames[unit] || unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              value={fromValue}
              onChange={(e) => handleFromChange(e.target.value)}
              placeholder="Enter value..."
              className="min-h-25 resize-y font-mono text-lg text-center"
            />
          </div>

          {/* Swap */}
          <div className="flex flex-col items-center justify-center md:pt-6">
            <button
              onClick={handleSwap}
              className={cn(
                "p-2 rounded-full bg-muted hover:bg-muted/80 transition-all duration-200",
                swapDirection && "rotate-180",
              )}
              aria-label="Swap units"
            >
              <ArrowLeftRight className="h-5 w-5 text-muted-foreground transition-transform duration-200" />
            </button>
          </div>

          {/* To */}
          <div className="space-y-3">
            <Label className="flex items-center justify-between text-sm font-medium">
              To
              <CopyButton value={toValue} size="sm">
                Copy
              </CopyButton>
            </Label>
            <Select
              value={toUnit}
              onValueChange={(value) => handleUnitChange(fromUnit, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select unit" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unitNames[unit] || unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              value={toValue}
              onChange={(e) => handleToChange(e.target.value)}
              placeholder="Result will appear here..."
              className="min-h-25 resize-y font-mono text-lg text-center"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <button
              onClick={handleClear}
              disabled={!fromValue && !toValue}
              className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-sm font-medium hover:bg-muted/80 disabled:opacity-50 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Clear
            </button>
            <button
              onClick={handleDownload}
              disabled={!fromValue || !toValue}
              className="inline-flex items-center gap-1.5 rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-brand/90 disabled:opacity-50 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Category:{" "}
            <span className="font-medium">{CATEGORY_LABELS[category]}</span>
            {fromUnit && toUnit && (
              <>
                {" "}
                |{" "}
                <span className="font-mono">
                  {fromUnit} → {toUnit}
                </span>
              </>
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
