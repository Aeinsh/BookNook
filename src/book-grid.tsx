import { Book } from "@shared/schema";
import BookCard from "./book-card";
import { Skeleton } from "@/components/ui/skeleton";

interface BookGridProps {
  books: Book[];
  isLoading: boolean;
  showNewBadge?: boolean;
  emptyMessage?: string;
}

export default function BookGrid({ 
  books, 
  isLoading, 
  showNewBadge = false,
  emptyMessage = "No books available."
}: BookGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="flex flex-col">
            <Skeleton className="w-full h-60 rounded-t-xl" />
            <div className="mt-2 space-y-2 p-2">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
              <Skeleton className="h-3 w-2/5" />
              <Skeleton className="h-8 w-full mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!books || books.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
      {books.map((book) => (
        <BookCard 
          key={book.id} 
          book={book} 
          showNewBadge={showNewBadge}
        />
      ))}
    </div>
  );
}
