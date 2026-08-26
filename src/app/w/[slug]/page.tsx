import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import ScrapbookTemplate from "@/components/viewer/ScrapbookTemplate";

const DEFAULT_THEME = {
  "--bg-canvas": "#f6f3eb",
  "--paper-cream": "#fffdf9",
  "--paper-lines": "#e2e8f0",
  "--paper-margin": "#fca5a5",
  "--ink-dark": "#1e293b",
  "--ink-blue": "#1e3a8a",
  "--ink-muted": "#64748b",
  "--tape-yellow": "rgba(254, 240, 138, 0.85)",
  "--tape-pink": "rgba(251, 207, 232, 0.85)",
  "--accent-coral": "#fb7185",
  "--accent-gold": "#f59e0b",
  "--font-hand": "var(--font-caveat)",
  "--font-doodle": "var(--font-patrick-hand)",
};

export const dynamic = "force-dynamic";

async function getWishData(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  try {
    const res = await fetch(`${apiUrl}/wishes/${slug}`, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch wish data: ${res.status}`);
    }
    
    return res.json();
  } catch (err) {
    console.error("Error fetching wish by slug:", err);
    return null;
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const wish = await getWishData(slug);
  
  if (!wish) return { title: "Birthday Wish Not Found" };

  const ogImage = wish.photos?.length > 0 
    ? wish.photos[0].image_url 
    : undefined;

  const title = wish.theme_overrides?.cover_headline 
    ? `${wish.theme_overrides.cover_headline}` 
    : `Special Wish for ${wish.recipient_name}! 🎁`;

  return {
    title: title,
    description: wish.theme_overrides?.cover_subtitle || `A special scrapbook wish from ${wish.sender_name}`,
    openGraph: {
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function WishViewerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const wish = await getWishData(slug);

  if (!wish) {
    notFound();
  }

  // Fire analytics tracking
  try {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/analytics/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wish_id: wish.id, event_type: "view" })
    }).catch(() => {});
  } catch (e) {}

  const dynamicTheme = {
    ...DEFAULT_THEME,
    ...(wish.theme_overrides || {})
  } as React.CSSProperties;

  return (
    <main style={dynamicTheme} className="w-full min-h-screen bg-[color:var(--bg-canvas)] overflow-hidden">
      <ScrapbookTemplate wish={wish} />
    </main>
  );
}
