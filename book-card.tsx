import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Book } from "@shared/schema";
import { getBookCoverFallback, getCategoryColor, getStarRating } from "@/lib/book-utils";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Bookmark, BookOpen } from "lucide-react";

interface BookCardProps {
  book: Book;
  showNewBadge?: boolean;
}

export default function BookCard({ book, showNewBadge = false }: BookCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isHovering, setIsHovering] = useState(false);

  // Fetch bookmark status
  const { data: bookmarks } = useQuery<any[]>({
    queryKey: ["/api/bookmarks"],
    enabled: !!user,
  });

  const isBookmarked = bookmarks?.some(bookmark => bookmark.bookId === book.id);

  // Toggle bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (isBookmarked) {
        await apiRequest("DELETE", `/api/bookmarks/${book.id}`);
      } else {
        await apiRequest("POST", "/api/bookmarks", { bookId: book.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      toast({
        title: isBookmarked ? "Bookmark removed" : "Bookmark added",
        description: isBookmarked 
          ? `"${book.title}" has been removed from your bookmarks.` 
          : `"${book.title}" has been added to your bookmarks.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleToggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      bookmarkMutation.mutate();
    } else {
      toast({
        title: "Authentication required",
        description: "Please log in to bookmark books.",
        variant: "destructive",
      });
    }
  };

  const bookCoverBg = getBookCoverFallback(book);

  return (
    <Card 
      className="h-full flex flex-col shadow-sm hover:shadow-md transition-shadow"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative pt-[140%]">
        {book.coverUrl ? (
          <img 
            src={book.coverUrl} 
            alt={`${book.title} cover`} 
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className={`absolute inset-0 w-full h-full ${bookCoverBg} flex items-center justify-center p-4`}>
            <span className="text-white text-center font-bold text-lg">
              {book.title}
            </span>
          </div>
        )}
        
        {showNewBadge && (
          <div className="absolute top-0 left-0 bg-amber-500 text-white text-xs font-medium px-2 py-1 rounded-br-lg">
            New
          </div>
        )}
        
        <button 
          className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 flex items-center justify-center ${isBookmarked ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'} hover:text-primary-600 dark:hover:text-primary-400 transition-colors`}
          aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
          onClick={handleToggleBookmark}
        >
          <Bookmark className="h-4 w-4" fill={isBookmarked ? "currentColor" : "none"} />
        </button>
      </div>
      
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-1">
          {book.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          {book.author}
        </p>
        
        <div className="flex items-center mb-3">
          <div className="flex items-center text-yellow-500">
            {getStarRating(book.rating)}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
            {book.rating?.toFixed(1) || "N/A"}
          </span>
        </div>
        
        {book.category && book.category.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {book.category.slice(0, 2).map((category, index) => (
              <span 
                key={index} 
                className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(category)}`}
              >
                {category}
              </span>
            ))}
            {book.category.length > 2 && (
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                +{book.category.length - 2}
              </span>
            )}
          </div>
        )}
        
        <div className="mt-auto">
          <Link href={`/read/${book.id}`}>
            <Button className="w-full">
              <BookOpen className="h-4 w-4 mr-2" />
              Read Now
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
