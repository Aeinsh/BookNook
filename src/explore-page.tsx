import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Book } from "@shared/schema";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import BookGrid from "@/components/books/book-grid";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BookOpen, Check, Bookmark } from "lucide-react";

export default function ExplorePage() {
  const [, navigate] = useLocation();
  const { category } = useParams<{ category: string }>();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSort, setSelectedSort] = useState<string>("newest");
  const [viewType, setViewType] = useState<string>("grid");
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);

  // Parse query parameters
  const queryParams = new URLSearchParams(window.location.search);
  const searchParam = queryParams.get("search");
  const recommendedParam = queryParams.get("recommended") === "true";
  const readingParam = queryParams.get("reading");
  const bookmarkedParam = queryParams.get("bookmarked") === "true";

  // Set search query from URL parameter
  useEffect(() => {
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [searchParam]);

  // Fetch all books
  const { data: allBooks, isLoading: isLoadingBooks } = useQuery<Book[]>({
    queryKey: ["/api/books"],
  });

  // Fetch books by category if category param is present
  const { data: categoryBooks, isLoading: isLoadingCategoryBooks } = useQuery<Book[]>({
    queryKey: [`/api/books?category=${category}`],
    enabled: !!category,
  });

  // Fetch recommended books if on recommended page
  const { data: recommendedBooks, isLoading: isLoadingRecommended } = useQuery<Book[]>({
    queryKey: ["/api/recommendations"],
    enabled: !!user && recommendedParam,
  });

  // Fetch user's reading progress
  const { data: readingProgress, isLoading: isLoadingProgress } = useQuery<any[]>({
    queryKey: ["/api/reading-progress"],
    enabled: !!user && !!readingParam,
  });

  // Fetch user's bookmarks
  const { data: bookmarks, isLoading: isLoadingBookmarks } = useQuery<any[]>({
    queryKey: ["/api/bookmarks"],
    enabled: !!user && bookmarkedParam,
  });

  // Filter and sort books based on current parameters
  useEffect(() => {
    let books: Book[] = [];

    if (category && categoryBooks) {
      books = [...categoryBooks];
    } else if (recommendedParam && recommendedBooks) {
      books = [...recommendedBooks];
    } else if (readingParam === "current" && readingProgress && allBooks) {
      const currentlyReading = readingProgress
        .filter(progress => !progress.completed)
        .map(progress => allBooks.find(book => book.id === progress.bookId))
        .filter(Boolean) as Book[];
      books = currentlyReading;
    } else if (readingParam === "completed" && readingProgress && allBooks) {
      const completed = readingProgress
        .filter(progress => progress.completed)
        .map(progress => allBooks.find(book => book.id === progress.bookId))
        .filter(Boolean) as Book[];
      books = completed;
    } else if (bookmarkedParam && bookmarks) {
      books = bookmarks.map(bookmark => bookmark.book);
    } else if (allBooks) {
      books = [...allBooks];
    }

    // Apply search filter if query exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      books = books.filter(
        book =>
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          (book.description && book.description.toLowerCase().includes(query)) ||
          (book.category && book.category.some(cat => cat.toLowerCase().includes(query)))
      );
    }

    // Apply sort
    if (selectedSort === "title") {
      books.sort((a, b) => a.title.localeCompare(b.title));
    } else if (selectedSort === "author") {
      books.sort((a, b) => a.author.localeCompare(b.author));
    } else if (selectedSort === "newest") {
      books.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      });
    } else if (selectedSort === "oldest") {
      books.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return 0;
      });
    } else if (selectedSort === "rating") {
      books.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    setFilteredBooks(books);
  }, [
    allBooks,
    categoryBooks,
    recommendedBooks,
    readingProgress,
    bookmarks,
    category,
    recommendedParam,
    readingParam,
    bookmarkedParam,
    searchQuery,
    selectedSort
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const getPageTitle = () => {
    if (category) {
      return `${category} Books`;
    }
    if (recommendedParam) {
      return "Recommended Books";
    }
    if (readingParam === "current") {
      return "Currently Reading";
    }
    if (readingParam === "completed") {
      return "Completed Books";
    }
    if (bookmarkedParam) {
      return "Bookmarked Books";
    }
    if (searchParam) {
      return `Search Results: "${searchParam}"`;
    }
    return "Explore Books";
  };

  const isLoading =
    isLoadingBooks ||
    (!!category && isLoadingCategoryBooks) ||
    (recommendedParam && isLoadingRecommended) ||
    (readingParam && isLoadingProgress) ||
    (bookmarkedParam && isLoadingBookmarks);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 pt-6 px-4 md:px-6 lg:px-8 pb-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {getPageTitle()}
            </h1>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="search"
                  placeholder="Search in results..."
                  className="w-full sm:w-64 pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 dark:text-gray-400" />
              </form>
              
              <Select
                value={selectedSort}
                onValueChange={setSelectedSort}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="author">Author</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {user && !category && !searchParam && !recommendedParam && (
            <div className="mb-8">
              <Tabs defaultValue={readingParam === "current" ? "reading" : bookmarkedParam ? "bookmarked" : "all"}>
                <TabsList className="mb-4">
                  <TabsTrigger 
                    value="all" 
                    onClick={() => navigate("/explore")}
                  >
                    All Books
                  </TabsTrigger>
                  <TabsTrigger 
                    value="reading" 
                    onClick={() => navigate("/explore?reading=current")}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Reading
                  </TabsTrigger>
                  <TabsTrigger 
                    value="completed" 
                    onClick={() => navigate("/explore?reading=completed")}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Completed
                  </TabsTrigger>
                  <TabsTrigger 
                    value="bookmarked" 
                    onClick={() => navigate("/explore?bookmarked=true")}
                  >
                    <Bookmark className="h-4 w-4 mr-2" />
                    Bookmarked
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}
          
          <BookGrid 
            books={filteredBooks} 
            isLoading={isLoading}
            showNewBadge={selectedSort === "newest"}
            emptyMessage={
              searchQuery 
                ? `No books found matching "${searchQuery}"`
                : category
                ? `No books found in category "${category}"`
                : readingParam === "current"
                ? "You're not currently reading any books. Start reading now!"
                : readingParam === "completed"
                ? "You haven't completed any books yet."
                : bookmarkedParam
                ? "You haven't bookmarked any books yet."
                : "No books available."
            }
          />
        </main>
      </div>
    </div>
  );
}
