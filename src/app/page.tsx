import type { Metadata } from 'next';
import { tools } from '@/features/tools/tool-registry';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site';
import { HomeClient } from '@/components/HomeClient';

export const metadata: Metadata = {
  title: { absolute: SITE_NAME },
  description: SITE_TAGLINE,
};

export default function Home() {
  const availableTools = tools.filter((tool) => !tool.planned);

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] bg-background overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Layered backdrop: blueprint grid */}
      <div className="absolute inset-0 bg-grid" aria-hidden="true" />

      {/* Glow orbs */}
      <div className="absolute top-[-18%] left-[-8%] w-[45%] h-[45%] bg-brand/20 blur-[130px] rounded-full animate-blob" aria-hidden="true" />
      <div className="absolute bottom-[-18%] right-[-8%] w-[42%] h-[42%] bg-glow/15 blur-[130px] rounded-full animate-blob-delay" aria-hidden="true" />
      <div className="absolute top-[32%] right-[18%] w-[22%] h-[22%] bg-brand/10 blur-[100px] rounded-full animate-blob-delay-2" aria-hidden="true" />

      <HomeClient availableTools={availableTools} />
    </div>
  );
}
