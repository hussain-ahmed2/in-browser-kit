import type { ToolDefinition } from "./types";

export const securityTools: ToolDefinition[] = [
  {
    slug: "password-toolkit",
    name: "Password Toolkit",
    tagline: "Generate strong passwords and check their strength.",
    icon: "KeyRound",
    category: "Security",
  },
  {
    slug: "hash-generator",
    name: "Hash Generator",
    tagline: "Hash text with SHA-1, SHA-256, SHA-384, or SHA-512.",
    icon: "Fingerprint",
    category: "Security",
  },
];
