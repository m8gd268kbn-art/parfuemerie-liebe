import Image from "next/image";

/** Zweispaltiges Auth-Layout: Formular links, ruhiges Flakon-Motiv rechts (ab Desktop). */
export function AuthShell({ title, intro, children, aside }: { title: string; intro?: React.ReactNode; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="container-page grid gap-12 pt-12 pb-24 lg:grid-cols-12 lg:gap-6 lg:pt-16">
      <div className="max-w-md lg:col-span-5">
        <h1 className="font-display text-h1">{title}</h1>
        {intro && <div className="mt-4 text-body text-ink-soft">{intro}</div>}
        <div className="mt-10">{children}</div>
        {aside && <div className="mt-10 border-t border-line pt-8 text-small text-ink-soft">{aside}</div>}
      </div>
      <div className="relative hidden aspect-[4/5] overflow-hidden bg-porcelain lg:col-span-6 lg:col-start-7 lg:block">
        <Image src="/media/worlds/musk.webp" alt="" fill sizes="45vw" className="object-cover" />
      </div>
    </div>
  );
}
