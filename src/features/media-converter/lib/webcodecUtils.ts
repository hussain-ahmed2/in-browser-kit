import type { MediaConversionFormValues } from "../types";
import type { ConversionVideoOptions } from "mediabunny";

export function buildWebCodecVideoConfig(values: Partial<MediaConversionFormValues>): ConversionVideoOptions {
    const videoConfig: ConversionVideoOptions = {
        hardwareAcceleration: "prefer-hardware",
    };

    if (values.resolution && values.resolution !== "original") {
        videoConfig.height = parseInt(values.resolution.replace("p", ""));
    }

    if (values.videoCodec && values.videoCodec !== "default") {
        videoConfig.codec = values.videoCodec;
    }

    return videoConfig;
}
