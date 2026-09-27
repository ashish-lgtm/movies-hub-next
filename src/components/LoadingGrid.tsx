type LoadingGridProps = {
    count?: number;
};

/** Skeleton placeholder grid shown while content is loading. */
export default function LoadingGrid({ count = 10 }: LoadingGridProps) {
    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: count }, (_, index) => (
                <div
                    key={index}
                    className="animate-fade-up"
                    style={{ animationDelay: `${index * 40}ms` }}
                >
                    <div className="skeleton aspect-[2/3] rounded-lg" />
                    <div className="skeleton mt-3 h-4 w-3/4 rounded" />
                    <div className="skeleton mt-2 h-3 w-1/2 rounded" />
                </div>
            ))}
        </div>
    );
}
