"use client";

import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { img_logo } from "@/config/config";
import { getProviderWatchLink } from "@/lib/watchLinks";
import type { WatchAvailability, WatchProvider } from "@/types/tmdb";

type WatchProvidersProps = {
    availability: WatchAvailability;
    title: string;
};

type ProviderRowProps = {
    label: string;
    providers: WatchProvider[];
    title: string;
    fallbackLink?: string;
};

/** Renders a horizontal row of streaming/rent/buy provider logos. */
function ProviderRow({
    label,
    providers,
    title,
    fallbackLink,
}: ProviderRowProps) {
    if (providers.length === 0) {
        return null;
    }

    return (
        <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
                {label}
            </p>
            <ul className="flex flex-wrap gap-2.5">
                {providers.map((provider) => {
                    const link = getProviderWatchLink(
                        provider.provider_id,
                        title,
                        fallbackLink
                    );

                    const content = (
                        <>
                            <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-surface-2">
                                {provider.logo_path ? (
                                    <Image
                                        src={`${img_logo}${provider.logo_path}`}
                                        alt=""
                                        fill
                                        className="object-cover"
                                        sizes="36px"
                                    />
                                ) : (
                                    <span className="flex h-full w-full items-center justify-center text-[10px] text-muted">
                                        {provider.provider_name.slice(0, 2)}
                                    </span>
                                )}
                            </span>
                            <span className="max-w-[7.5rem] truncate text-xs text-foreground sm:text-sm">
                                {provider.provider_name}
                            </span>
                        </>
                    );

                    return (
                        <li key={`${label}-${provider.provider_id}`}>
                            {link ? (
                                <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 rounded-md border border-border bg-surface-2/60 px-2 py-1.5 transition-colors hover:border-accent/50 hover:bg-surface-2"
                                    title={`Open ${provider.provider_name}`}
                                >
                                    {content}
                                </a>
                            ) : (
                                <div className="flex items-center gap-2 rounded-md border border-border bg-surface-2/60 px-2 py-1.5">
                                    {content}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

/** Shows streaming platforms where a title is available to watch. */
export default function WatchProviders({
    availability,
    title,
}: WatchProvidersProps) {
    const hasAny =
        availability.stream.length > 0 ||
        availability.rent.length > 0 ||
        availability.buy.length > 0;

    if (!hasAny) {
        return null;
    }

    return (
        <div>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted">
                    Where to watch
                    <span className="ml-2 tracking-normal text-muted/70">
                        ({availability.region})
                    </span>
                </p>
                {availability.link && (
                    <a
                        href={availability.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-accent-soft transition-colors hover:text-accent"
                    >
                        More options
                        <ExternalLink className="h-3 w-3" />
                    </a>
                )}
            </div>

            <div className="flex flex-col gap-3">
                <ProviderRow
                    label="Stream"
                    providers={availability.stream}
                    title={title}
                    fallbackLink={availability.link}
                />
                <ProviderRow
                    label="Rent"
                    providers={availability.rent}
                    title={title}
                    fallbackLink={availability.link}
                />
                <ProviderRow
                    label="Buy"
                    providers={availability.buy}
                    title={title}
                    fallbackLink={availability.link}
                />
            </div>
        </div>
    );
}
