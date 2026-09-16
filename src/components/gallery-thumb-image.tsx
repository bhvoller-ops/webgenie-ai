import Image from "next/image";
import { SITE_ORIGIN } from "@/lib/site-url";

/**
 * Owner-review finding: this app's own self-hosted hero photos
 * (${SITE_ORIGIN}/gallery-photos/*.jpg -- 9 of the 64 industry configs)
 * were rendering through a plain <img>, same as the other 55 configs'
 * externally-hosted (Pexels) photos -- but only the external ones have a
 * structural excuse (next/image requires next.config.ts's
 * images.remotePatterns to optimize a remote host, which isn't configured
 * here). The self-hosted subset has no such excuse and is switched to
 * next/image below; the Pexels-hosted subset is unchanged (still a plain
 * <img loading="lazy">) rather than widening next.config.ts's allowed
 * remote hosts as a side effect of this pass.
 *
 * Samples/Gallery consolidation: pulled out of gallery-client.tsx (a "use
 * client" file) into its own plain, environment-agnostic component so the
 * homepage's featured Examples section (a Server Component) can render it
 * too. This only takes the string fields it actually needs, not a
 * whole IndustryConfig -- that config's `services`/`whyUs` arrays embed
 * real React component references (Lucide icons) that a Server Component
 * cannot pass as a prop into a Client Component (a real bug hit and fixed
 * here: passing the full config from page.tsx into the old, "use
 * client"-file version of this component failed in production with
 * "Functions cannot be passed directly to Client Components"). Taking
 * only heroImage/thumbnailImage/industryName makes that whole class of
 * failure structurally impossible, not just avoided this one time.
 *
 * Gallery hero-image refresh: `thumbnailImage` (IndustryConfig's optional
 * field) is a separate, smaller derivative for exactly this card -- when a
 * template has one, this card must never request the full-resolution hero
 * payload just to render a small grid thumbnail. Falls back to `heroImage`
 * for the templates that don't have one yet, so nothing else changes.
 */
export function GalleryThumbImage({
  heroImage,
  thumbnailImage,
  industryName,
}: {
  heroImage: string;
  thumbnailImage?: string;
  industryName: string;
}) {
  const src = thumbnailImage ?? heroImage;
  const isSelfHosted = src.startsWith(SITE_ORIGIN);
  if (isSelfHosted) {
    // next/image only treats a RELATIVE path as automatically local/
    // optimizable with zero config -- an absolute URL is checked against
    // next.config.ts's images.remotePatterns even when the host happens
    // to equal this deployment's own domain (confirmed: this 400'd
    // locally against this app's own absolute URL). Stripping back to the
    // relative path sidesteps that entirely, since these files are
    // genuinely served from this app's own public/ directory regardless
    // of which domain is currently serving the request.
    const relativePath = src.slice(SITE_ORIGIN.length);
    return (
      <Image
        src={relativePath}
        alt={industryName}
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition duration-500 group-hover:scale-105"
      />
    );
  }
  return <img src={src} alt={industryName} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />;
}
