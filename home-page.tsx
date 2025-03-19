import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { BookOpen, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Book, ReadingProgress } from "@shared/schema";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import BookCard from "@/components/books/book-card";
import BookGrid from "@/components/books/book-grid";
import CategoryCard from "@/components/books/category-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { user } = useAuth();

  // Fetch books user is currently reading
  const { data: readingProgressList, isLoading: isLoadingProgress } = useQuery<ReadingProgress[]>({
    queryKey: ["/api/reading-progress"],
    enabled: !!user,
  });

  // Fetch all books to populate currently reading section
  const { data: allBooks, isLoading: isLoadingBooks } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  // Fetch recommended books based on user's reading history
  const { data: recommendedBooks, isLoading: isLoadingRecommendations } = useQuery<Book[]>({
    queryKey: ["/api/recommendations"],
    enabled: !!user,
  });

  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Function to get book details from the reading progress
  const getBooksWithProgress = () => {
    if (!readingProgressList || !allBooks) return [];
    
    return readingProgressList
      .filter(progress => progress.completed === false)
      .map(progress => {
        const book = allBooks.find(b => b.id === progress.bookId);
        if (book) {
          return { book, progress };
        }
        return null;
      })
      .filter(item => item !== null) as { book: Book; progress: ReadingProgress }[];
  };

  const booksWithProgress = getBooksWithProgress();

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 pt-6 px-4 md:px-6 lg:px-8 pb-16">
          {/* Hero Section */}
          <section className="mb-12 relative">
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl overflow-hidden">
              <div className="relative z-10 py-10 px-6 md:px-12 lg:w-2/3">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Discover Your Next Favorite Book</h1>
                <p className="text-primary-100 mb-6 max-w-xl">
                  Explore thousands of free and open-source books in our digital library. Read anywhere, track your progress, and get personalized recommendations.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/explore">
                    <Button variant="default" className="bg-white text-primary-600 hover:bg-gray-100">
                      Browse Library
                    </Button>
                  </Link>
                  <Link href="/explore?recommended=true">
                    <Button variant="default" className="bg-primary-700 text-white hover:bg-primary-800">
                      Get Recommendations
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 w-1/3 h-full bg-right-bottom bg-no-repeat bg-contain hidden lg:block" 
                  style={{backgroundImage: "url('https://images.unsplash.com/photo-1495446815901-a7297e633e8d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80')"}}>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary-600/80 lg:block hidden"></div>
            </div>
          </section>
          
          {/* Continue Reading Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Continue Reading</h2>
              <Link href="/explore" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium">
                View all
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingProgress || isLoadingBooks ? (
                // Loading skeleton
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start space-x-4">
                      <Skeleton className="w-20 h-28 rounded" />
                      <div className="flex-1">
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2 mb-4" />
                        <Skeleton className="h-3 w-full mb-2" />
                        <Skeleton className="h-8 w-full mt-6" />
                      </div>
                    </div>
                  </div>
                ))
              ) : booksWithProgress.length > 0 ? (
                // Books with reading progress
                booksWithProgress.map(({ book, progress }) => (
                  <div key={book.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="p-5">
                      <div className="flex items-start space-x-4">
                        <div className="w-20 h-28 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                          <img 
                            src={book.coverUrl || "https://via.placeholder.com/100x140?text=No+Cover"} 
                            alt={`${book.title} cover`} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">{book.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{book.author}</p>
                          <div className="flex items-center mb-2">
                            <div className="flex items-center text-yellow-500">
                              {[...Array(Math.floor(book.rating || 0))].map((_, i) => (
                                <span key={i} className="text-xs">★</span>
                              ))}
                              {book.rating && book.rating % 1 >= 0.5 && (
                                <span className="text-xs">★</span>
                              )}
                              {[...Array(5 - Math.ceil(book.rating || 0))].map((_, i) => (
                                <span key={i} className="text-xs text-gray-300 dark:text-gray-600">★</span>
                              ))}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">{book.rating?.toFixed(1)}</span>
                          </div>
                          <div className="mb-3">
                            <div className="relative h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="absolute left-0 top-0 h-full bg-primary-500 rounded-full" 
                                style={{ width: `${progress.progress}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400">{progress.progress}% complete</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Page {progress.currentPage} of {progress.totalPages}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Link href={`/read/${book.id}`}>
                          <Button 
                            variant="outline" 
                            className="w-full bg-primary-50 dark:bg-gray-700 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-gray-600"
                          >
                            Continue Reading
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                // No books in progress
                <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No books in progress</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Start reading a book to see your progress here.</p>
                  <Link href="/explore">
                    <Button>Browse Books</Button>
                  </Link>
                </div>
              )}
            </div>
          </section>
          
          {/* Recommended Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recommended For You</h2>
              <Link href="/explore?recommended=true" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium">
                View all
              </Link>
            </div>
            
            <div className="relative">
              <div className="flex space-x-6 overflow-x-auto pb-4">
                {isLoadingRecommendations ? (
                  // Loading skeleton
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="flex-shrink-0 w-40">
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 h-full">
                        <Skeleton className="w-full h-56 rounded-t-xl" />
                        <div className="p-3">
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-3 w-2/3 mb-3" />
                          <Skeleton className="h-6 w-full" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : recommendedBooks && recommendedBooks.length > 0 ? (
                  // Recommended books
                  recommendedBooks.map(book => (
                    <div key={book.id} className="flex-shrink-0 w-40">
                      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                        <div className="relative pb-[140%]">
                          <img 
                            src={book.coverUrl || "https://via.placeholder.com/200x280?text=No+Cover"} 
                            alt={`${book.title} cover`} 
                            className="absolute inset-0 w-full h-full object-cover"
                          />
                          <button 
                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" 
                            aria-label="Add to favorites"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                            </svg>
                          </button>
                        </div>
                        <div className="p-3 flex-1 flex flex-col">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{book.title}</h3>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{book.author}</p>
                          <div className="flex items-center mt-1 mb-auto">
                            <div className="flex items-center text-yellow-500">
                              <span className="text-xs">★</span>
                              <span className="text-xs ml-1">{book.rating?.toFixed(1) || "N/A"}</span>
                            </div>
                          </div>
                          <Link href={`/read/${book.id}`}>
                            <Button 
                              variant="outline" 
                              className="mt-2 w-full py-1.5 text-xs bg-primary-50 dark:bg-gray-700 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-gray-600"
                            >
                              Read Now
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // No recommendations
                  <div className="w-full bg-white dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-600 dark:text-gray-400">
                      Start reading books to get personalized recommendations.
                    </p>
                  </div>
                )}
              </div>
              
              <button className="absolute right-0 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center text-gray-800 dark:text-gray-200 focus:outline-none z-10">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </section>
          
          {/* Popular Categories */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Popular Categories</h2>
              <Link href="/explore" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium">
                Browse all
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {isLoadingCategories ? (
                // Loading skeleton
                Array(4).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))
              ) : categories && categories.length > 0 ? (
                // Categories
                categories.slice(0, 4).map(category => (
                  <CategoryCard key={category.id} category={category} />
                ))
              ) : (
                // No categories
                <div className="col-span-2 md:col-span-3 lg:col-span-4 bg-white dark:bg-gray-800 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-400">No categories available.</p>
                </div>
              )}
            </div>
          </section>
          
          {/* Latest Additions */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Latest Additions</h2>
              <Link href="/explore?sort=newest" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium">
                View all
              </Link>
            </div>
            
            <BookGrid 
              books={allBooks?.slice(0, 5) || []} 
              isLoading={isLoadingBooks}
              showNewBadge={true}
            />
          </section>
        </main>
      </div>
    </div>
  );
}
