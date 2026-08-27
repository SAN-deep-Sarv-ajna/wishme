import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import UnboxingGate from "@/components/viewer/UnboxingGate";

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

  const repName = (wish.nickname || wish.recipient_name || "You").trim();
  const senderName = (wish.sender_name || "Someone special").trim();
  
  const rawTitle = wish.theme_overrides?.cover_headline 
    ? `${wish.theme_overrides.cover_headline}` 
    : `Special Wish for ${repName}! 🎁`;

  const cleanTitle = rawTitle
    .replace(/\{name\}|\{recipient\}|\{recipient_name\}|\[name\]/gi, repName)
    .replace(/\{sender\}|\{sender_name\}|\[sender\]/gi, senderName);

  const rawDesc = wish.theme_overrides?.cover_subtitle || `A special scrapbook wish from ${senderName}`;
  const cleanDesc = rawDesc
    .replace(/\{name\}|\{recipient\}|\{recipient_name\}|\[name\]/gi, repName)
    .replace(/\{sender\}|\{sender_name\}|\[sender\]/gi, senderName);

  return {
    title: cleanTitle,
    description: cleanDesc,
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

  const isScrubbed = wish.is_scrubbed || wish.recipient_name === "[SCRUBBED]";

  if (isScrubbed) {
    return (
      <main className="w-full min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] p-8 md:p-12 shadow-2xl">
          <div className="w-20 h-20 bg-slate-800/80 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-slate-700">
            <span className="text-3xl">🔒</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Memory Secured</h1>
          <p className="text-slate-400 text-sm leading-relaxed font-medium mb-8">
            To protect your privacy, the creator has securely shredded this digital scrapbook. All photos, audio, and personal messages have been permanently deleted from our servers.
          </p>
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-full text-xs font-bold border border-emerald-500/20">
            ✓ 100% Data Wiped
          </div>
        </div>
      </main>
    );
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
      <UnboxingGate wish={wish} />
    </main>
  );
}
