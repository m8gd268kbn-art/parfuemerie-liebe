import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";

export function SectionHeader({ id, title, href, linkLabel, children }: { id?: string; title: string; href?: string; linkLabel?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-3 md:mb-10">
      <div className="max-w-2xl">
        <h2 id={id} className="font-display text-h2">
          {title}
        </h2>
        {children && <p className="mt-3 text-body text-ink-soft">{children}</p>}
      </div>
      {href && (
        <Link href={href} className="group inline-flex items-center gap-2 text-small font-medium text-ink md:mr-24">
          <span className="link-underline">{linkLabel ?? "Alle ansehen"}</span>
          <Icon icon={ArrowRight} size={16} className="transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
