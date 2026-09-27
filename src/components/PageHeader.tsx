type PageHeaderProps = {
    title: string;
    subtitle?: string;
};

/** Page title block with optional subtitle and accent rule. */
export default function PageHeader({ title, subtitle }: PageHeaderProps) {
    return (
        <div className="mb-8 animate-fade-in">
            <h1 className="page-title text-3xl font-bold text-foreground sm:text-4xl md:text-5xl">
                {title}
            </h1>
            {subtitle && (
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
                    {subtitle}
                </p>
            )}
            <div className="mt-4 h-px w-16 bg-accent" />
        </div>
    );
}
