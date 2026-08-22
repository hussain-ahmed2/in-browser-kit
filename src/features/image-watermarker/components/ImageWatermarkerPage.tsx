"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, useWatch, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StepIndicator } from "@/components/StepIndicator";
import { FileDropzone } from "@/components/FileDropzone";
import { InputField } from "@/components/form/input-field";
import { SelectField } from "@/components/form/select-field";
import { SliderField } from "@/components/form/slider-field";
import { CheckboxField } from "@/components/form/checkbox-field";
import { POSITION_PRESETS, WATERMARKER_DEFAULTS, type WatermarkSettings } from "../constants";
import { watermarkerSchema } from "../types";
import { resolveExportMime, deriveOutputName, renderWatermark, loadImageFromFile } from "../lib/watermark";

const steps = [{ label: "Upload" }, { label: "Style" }, { label: "Download" }];

export function ImageWatermarkerPage() {
	const [file, setFile] = useState<File | null>(null);
	const [result, setResult] = useState<File | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const baseImageRef = useRef<HTMLImageElement | null>(null);
	const logoImageRef = useRef<HTMLImageElement | null>(null);

	const form = useForm<WatermarkSettings>({
		resolver: zodResolver(watermarkerSchema),
		mode: "onChange",
		defaultValues: WATERMARKER_DEFAULTS,
	});

	const settings = useWatch({ control: form.control }) as WatermarkSettings;

	const handleFileSelect = async (selectedFile: File) => {
		setResult(null);
		try {
			const img = await loadImageFromFile(selectedFile);
			baseImageRef.current = img;
			setFile(selectedFile);
		} catch {
			toast.error("Could not load image.");
		}
	};

	const handleLogoSelect = async (selectedFile: File) => {
		try {
			const img = await loadImageFromFile(selectedFile);
			logoImageRef.current = img;
			form.setValue("logoScalePct", 20);
		} catch {
			toast.error("Could not load logo.");
		}
	};

	const handleClear = () => {
		setFile(null);
		setResult(null);
		baseImageRef.current = null;
		logoImageRef.current = null;
		form.reset(WATERMARKER_DEFAULTS);
	};

	const currentStep = result ? 2 : file ? 1 : 0;

	const format = useWatch({ control: form.control, name: "format" });
	const isLossyOutput =
		format === "image/jpeg" ||
		format === "image/webp" ||
		(format === "keep" && (file?.type === "image/jpeg" || file?.type === "image/webp"));

	useEffect(() => {
		if (!file || !baseImageRef.current || !canvasRef.current) return;
		renderWatermark(canvasRef.current, baseImageRef.current, logoImageRef.current, settings);
	}, [file, settings]);

	const handleProcess = async () => {
		if (!file || !baseImageRef.current || !canvasRef.current) return;
		setIsProcessing(true);
		try {
			const canvas = canvasRef.current;
			const mime = resolveExportMime(settings.format, file.type);
			canvas.toBlob(
				(blob) => {
					if (!blob) throw new Error("Export failed");
					const exportedFile = new File([blob], deriveOutputName("watermarked-image", mime), {
						type: mime,
						lastModified: Date.now(),
					});
					setResult(exportedFile);
					toast.success("Watermark applied successfully!");
				},
				mime,
				settings.quality,
			);
		} catch (error: unknown) {
			console.error("Watermark failed:", error);
			toast.error("Error applying watermark. The image might be corrupt or unsupported.");
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<>
			<StepIndicator steps={steps} currentStep={currentStep} />

			<Card className="animate-fade-in-up stagger-4 backdrop-blur-md ring-border">
				<CardHeader>
					<CardTitle>Image Watermarker</CardTitle>
					<CardDescription>
						Stamp text or logo watermarks onto images with full position control.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-8">
					{!file ? (
						<FileDropzone
							onFiles={({ 0: file }) => handleFileSelect(file)}
							accept="image/*"
							multiple={false}
							label="Click or drag and drop to add image"
						/>
					) : (
						<FormProvider {...form}>
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
								<div className="space-y-4">
									<p className="text-sm text-muted-foreground">Live Preview</p>
									<div className="rounded-xl bg-secondary/50 p-4">
										<canvas
											ref={canvasRef}
											className="max-w-full h-auto"
											aria-label="Watermark preview"
										/>
									</div>
								</div>

								<div className="space-y-6">
									<div className="grid grid-cols-2 gap-3">
										<Button
											variant={settings.type === "text" ? "default" : "outline"}
											onClick={() => form.setValue("type", "text")}
											className="w-full py-2"
										>
											Text
										</Button>
										<Button
											variant={settings.type === "logo" ? "default" : "outline"}
											onClick={() => form.setValue("type", "logo")}
											className="w-full py-2"
										>
											Logo
										</Button>
									</div>
									{settings.type === "text" && (
										<>
											<InputField
												name="text"
												label="Watermark Text"
												placeholder="Enter watermark text"
											/>
											<div className="grid grid-cols-2 gap-4 items-end">
												<InputField
													name="fontSizePct"
													label="Font Size %"
													type="number"
													step={0.1}
												/>
												<CheckboxField name="bold" label="Bold" />
												<InputField name="color" label="Color" type="color" />
												<SliderField
													name="opacityPct"
													label="Opacity"
													min={5}
													max={100}
													step={1}
													formatValue={(v) => `${v}%`}
												/>
												<SliderField
													name="rotationDeg"
													label="Rotation"
													min={-180}
													max={180}
													step={5}
													formatValue={(v) => `${v}°`}
												/>
												<SliderField
													name="marginPct"
													label="Margin %"
													min={0}
													max={25}
													step={0.5}
													formatValue={(v) => `${v}%`}
												/>
											</div>
										</>
									)}

									{settings.type === "logo" && (
										<>
											<InputField
												name="logoScalePct"
												label="Logo Scale %"
												type="number"
												step={0.5}
											/>
											<div className="col-span-4">
												<FileDropzone
													onFiles={({ 0: file }) => handleLogoSelect(file)}
													accept="image/*"
													multiple={false}
													label="Upload Logo"
													hint="JPG, PNG, WebP"
												/>
											</div>
										</>
									)}

									<div className="col-span-4 grid grid-cols-3 gap-2">
										{POSITION_PRESETS.map((p) => (
											<Button
												key={p.value}
												variant={settings.preset === p.value ? "default" : "outline"}
												onClick={() =>
													form.setValue("preset", p.value as WatermarkSettings["preset"])
												}
												className="h-9 py-1 text-xs"
											>
												{p.label}
											</Button>
										))}
									</div>

									<SelectField
										name="format"
										label="Format"
										options={[
											{ label: "Keep Original", value: "keep" },
											{ label: "JPEG", value: "image/jpeg" },
											{ label: "PNG", value: "image/png" },
											{ label: "WebP", value: "image/webp" },
										]}
									/>
									{isLossyOutput && (
										<SliderField
											name="quality"
											label="Quality"
											min={0.1}
											max={1}
											step={0.05}
											formatValue={(v) => `${Math.round(v * 100)}%`}
										/>
									)}
								</div>
							</div>

							{result ? (
								<div className="space-y-4">
									<p className="text-sm text-muted-foreground">
										{result.name} — {Math.round(result.size / 1024)} KB
									</p>
									<div className="flex gap-3">
										<Button
											onClick={() => {
												const url = URL.createObjectURL(result);
												const a = document.createElement("a");
												a.href = url;
												a.download = result.name;
												a.click();
												URL.revokeObjectURL(url);
											}}
											variant="default"
											type="button"
										>
											Download
										</Button>
										<Button onClick={handleClear} variant="outline" type="button">
											Start over
										</Button>
									</div>
								</div>
							) : (
								<div className="flex justify-end">
									<Button
										onClick={handleProcess}
										disabled={isProcessing}
										className="w-full sm:w-auto bg-linear-to-r from-brand to-[color-mix(in_oklab,var(--brand)_60%,var(--glow))] text-brand-foreground hover:shadow-[0_0_28px_-6px] hover:shadow-brand/60"
									>
										{isProcessing ? (
											<>
												<Loader2 className="animate-spin" aria-hidden="true" />
												Applying watermark...
											</>
										) : (
											"Apply Watermark"
										)}
									</Button>
								</div>
							)}
						</FormProvider>
					)}
				</CardContent>
			</Card>
		</>
	);
}
