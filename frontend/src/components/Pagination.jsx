import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export default function Pagination({ links, onPageChange }) {
    if (!links || links.length <= 3) return null; // Don't show if only prev/next and no pages, or just 1 page

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            {links.map((link, index) => {
                // Parse the label to handle HTML entities like &laquo; and &raquo;
                const label = link.label
                    .replace('&laquo; Previous', '')
                    .replace('Next &raquo;', '')
                    .trim();

                const isPrev = link.label.includes('Previous');
                const isNext = link.label.includes('Next');

                // If it's a "..." separator
                if (link.label === '...') {
                    return (
                        <span key={index} className="px-3 py-2 text-gray-500 dark:text-slate-400">
                            ...
                        </span>
                    );
                }

                return (
                    <button
                        key={index}
                        onClick={() => {
                            if (link.url) {
                                // Extract page number from URL
                                const url = new URL(link.url);
                                const page = url.searchParams.get('page');
                                onPageChange(parseInt(page));
                            }
                        }}
                        disabled={!link.url || link.active}
                        className={clsx(
                            "flex items-center justify-center min-w-[2.5rem] h-10 px-3 rounded-lg text-sm font-medium transition-colors",
                            link.active
                                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                                : !link.url
                                    ? "text-gray-400 dark:text-slate-600 cursor-not-allowed"
                                    : "text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400"
                        )}
                    >
                        {isPrev ? <ChevronLeft className="h-4 w-4" /> : isNext ? <ChevronRight className="h-4 w-4" /> : label}
                    </button>
                );
            })}
        </div>
    );
}
