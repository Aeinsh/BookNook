import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Book, ReadingProgress, Bookmark } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getStarRating, getCategoryColor, calculateTimeToRead } from "@/lib/book-utils";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Clock, 
  Calendar, 
  BookOpen, 
  Users, 
  Globe, 
  Bookmark as BookmarkIcon, 
  ArrowLeft
} from "lucide-react";

export default function BookPage() {
  const { id } = useParams<{ id: string }>();
  const bookId = parseInt(id);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch book details
  const { data: book, isLoading: isLoadingBook } = useQuery<Book>({
    queryKey: [`/api/books/${bookId}`],
    enabled: !isNaN(bookId),
  });

  // Fetch reading progress if user is logged in
  const { data: readingProgress, isLoading: isLoadingProgress } = useQuery<ReadingProgress>({
    queryKey: [`/api/reading-progress/${bookId}`],
    enabled: !isNaN(bookId) && !!user,
  });

  // Fetch user's bookmarks to check if this book is bookmarked
  const { data: bookmarks, isLoading: isLoadingBookmarks } = useQuery<(Bookmark & { book: Book })[]>({
    queryKey: ["/api/bookmarks"],
    enabled: !!user,
  });

  const isBookmarked = bookmarks?.some(bookmark => bookmark.bookId === bookId);

  // Toggle bookmark mutation
  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      if (isBookmarked) {
        await apiRequest("DELETE", `/api/bookmarks/${bookId}`);
      } else {
        await apiRequest("POST", "/api/bookmarks", { bookId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookmarks"] });
      toast({
        title: isBookmarked ? "Bookmark removed" : "Bookmark added",
        description: isBookmarked ? "The book has been removed from your bookmarks." : "The book has been added to your bookmarks.",
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

  const handleToggleBookmark = () => {
    bookmarkMutation.mutate();
  };

  const handleStartReading = () => {
    navigate(`/read/${bookId}`);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 pt-6 px-4 md:px-6 lg:px-8 pb-16">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={handleGoBack}
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          
          {isLoadingBook ? (
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-8">
                <Skeleton className="w-full md:w-1/3 h-80 rounded-xl" />
                <div className="w-full md:w-2/3">
                  <Skeleton className="h-10 w-3/4 mb-4" />
                  <Skeleton className="h-6 w-1/2 mb-6" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-8" />
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                  </div>
                  <Skeleton className="h-28 w-full" />
                </div>
              </div>
            </div>
          ) : book ? (
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Book cover */}
                <div className="w-full md:w-1/3 flex-shrink-0">
                  <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 p-4">
                    <div className="aspect-[2/3] overflow-hidden rounded shadow mb-4">
                      <img 
                        src={book.coverUrl || "https://via.placeholder.com/400x600?text=No+Cover"} 
                        alt={`${book.title} cover`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <Button 
                        className="flex-1"
                        onClick={handleStartReading}
                      >
                        <BookOpen className="h-4 w-4 mr-2" /> Read Now
                      </Button>
                      <Button 
                        variant={isBookmarked ? "default" : "outline"}
                        className={isBookmarked ? "bg-primary-600" : ""}
                        onClick={handleToggleBookmark}
                        disabled={bookmarkMutation.isPending}
                      >
                        <BookmarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Book details */}
                <div className="w-full md:w-2/3">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{book.title}</h1>
                  <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">{book.author}</p>
                  
                  <div className="flex items-center mb-6">
                    <div className="flex items-center text-yellow-500 mr-3">
                      {getStarRating(book.rating)}
                      <span className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                        {book.rating?.toFixed(1) || "N/A"}
                      </span>
                    </div>
                    
                    {readingProgress && (
                      <div className="border-l pl-3 border-gray-300 dark:border-gray-700">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {readingProgress.progress}% complete
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About the book</h2>
                    <p className="text-gray-700 dark:text-gray-300">
                      {book.description || "No description available for this book."}
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Published Year</div>
                          <div className="font-medium">{book.publishedYear || "Unknown"}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Reading Time</div>
                          <div className="font-medium">{calculateTimeToRead(book)}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Pages</div>
                          <div className="font-medium">{book.pages || "Unknown"}</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Globe className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Language</div>
                          <div className="font-medium">{book.language || "Unknown"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {book.category && book.category.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Categories</h2>
                      <div className="flex flex-wrap gap-2">
                        {book.category.map((cat, index) => (
                          <span 
                            key={index} 
                            className={`px-3 py-1 rounded-full text-sm ${getCategoryColor(cat)}`}
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {readingProgress && readingProgress.progress > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Your Reading Progress</h2>
                      <div className="relative h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                        <div 
                          className="absolute left-0 top-0 h-full bg-primary-500 rounded-full" 
                          style={{ width: `${readingProgress.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <div>Page {readingProgress.currentPage} of {readingProgress.totalPages}</div>
                        <div>{readingProgress.progress}% complete</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-4 mt-8">
                    <Button 
                      className="flex-1"
                      onClick={handleStartReading}
                    >
                      {readingProgress && readingProgress.progress > 0 ? (
                        <>Continue Reading</>
                      ) : (
                        <>Start Reading</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Book not found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">The book you are looking for does not exist or has been removed.</p>
              <Button onClick={() => navigate("/")}>Back to Home</Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
