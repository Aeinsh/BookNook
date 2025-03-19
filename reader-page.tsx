import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Book, ReadingProgress } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, BookOpen, Bookmark, Settings, ChevronLeft, ChevronRight, Volume2, Sun, Moon, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PDFViewer from "@/components/reader/pdf-viewer";
import EPUBViewer from "@/components/reader/epub-viewer";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useDarkMode } from "@/lib/use-dark-mode";

export default function ReaderPage() {
  const { id } = useParams<{ id: string }>();
  const bookId = parseInt(id);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useDarkMode();
  const [fontSize, setFontSize] = useState(16);
  const [showControls, setShowControls] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const controlsTimeoutRef = useRef<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch book details
  const { data: book, isLoading: isLoadingBook } = useQuery<Book>({
    queryKey: [`/api/books/${bookId}`],
    enabled: !isNaN(bookId),
  });

  // Fetch reading progress if user is logged in
  const { data: readingProgress, isLoading: isLoadingProgress } = useQuery<ReadingProgress>({
    queryKey: [`/api/reading-progress/${bookId}`],
    enabled: !isNaN(bookId) && !!user,
    onSuccess: (data) => {
      if (data) {
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
      }
    }
  });

  // Update reading progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async (data: { currentPage: number, progress: number }) => {
      return await apiRequest("POST", "/api/reading-progress", {
        bookId,
        currentPage: data.currentPage,
        totalPages,
        progress: data.progress,
        lastReadAt: new Date(),
        completed: data.progress === 100,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/reading-progress/${bookId}`] });
      queryClient.invalidateQueries({ queryKey: ["/api/reading-progress"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error saving progress",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Function to update reading progress
  const updateProgress = (page: number) => {
    setCurrentPage(page);
    
    // Calculate progress percentage
    const progress = Math.round((page / totalPages) * 100);
    
    // Update progress in database
    if (user) {
      updateProgressMutation.mutate({ currentPage: page, progress });
    }
  };

  // Handle page change from PDF/EPUB viewers
  const handlePageChange = (page: number) => {
    updateProgress(page);
    resetControlsTimeout();
  };

  // Handle total pages update from PDF/EPUB viewers
  const handleTotalPagesChange = (pages: number) => {
    setTotalPages(pages);
  };

  // Auto-hide controls after inactivity
  const resetControlsTimeout = () => {
    // Clear existing timeout
    if (controlsTimeoutRef.current) {
      window.clearTimeout(controlsTimeoutRef.current);
    }
    
    // Show controls
    setShowControls(true);
    
    // Set new timeout
    controlsTimeoutRef.current = window.setTimeout(() => {
      setShowControls(false);
    }, 5000);
  };

  // Setup event listeners for mouse movement
  useEffect(() => {
    const handleMouseMove = () => resetControlsTimeout();
    document.addEventListener('mousemove', handleMouseMove);
    
    // Initial timeout
    resetControlsTimeout();
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) {
        window.clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          if (currentPage > 1) {
            updateProgress(currentPage - 1);
          }
          break;
        case 'ArrowRight':
          if (currentPage < totalPages) {
            updateProgress(currentPage + 1);
          }
          break;
        case 'f':
          // Toggle fullscreen
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.documentElement.requestFullscreen();
          }
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages]);

  // Go to previous page
  const goToPrevPage = () => {
    if (currentPage > 1) {
      updateProgress(currentPage - 1);
    }
  };

  // Go to next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      updateProgress(currentPage + 1);
    }
  };

  // Handle font size change
  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value[0]);
  };

  // Go back to book details
  const handleGoBack = () => {
    navigate(`/book/${bookId}`);
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 relative">
      {/* Header - shown when controls are visible */}
      <header className={`bg-white dark:bg-gray-800 shadow-sm flex items-center justify-between p-4 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
        <Button variant="ghost" onClick={handleGoBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Book
        </Button>
        
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white text-center flex-grow truncate px-4">
          {isLoadingBook ? <Skeleton className="h-6 w-48 mx-auto" /> : book?.title}
        </h1>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Bookmark className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowSidebar(!showSidebar)}>
            <BookOpen className="h-5 w-5" />
          </Button>
        </div>
      </header>
      
      {/* Main reading area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Document viewer */}
        <div className="flex-1 overflow-y-auto p-4 font-serif">
          {isLoadingBook ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Skeleton className="h-6 w-48 mx-auto mb-4" />
                <Skeleton className="h-64 w-full max-w-3xl mx-auto" />
              </div>
            </div>
          ) : book ? (
            book.fileType === 'pdf' ? (
              <PDFViewer 
                fileUrl={book.fileUrl} 
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onTotalPagesChange={handleTotalPagesChange}
                fontSize={fontSize}
              />
            ) : (
              <EPUBViewer 
                fileUrl={book.fileUrl} 
                currentPage={currentPage}
                onPageChange={handlePageChange}
                onTotalPagesChange={handleTotalPagesChange}
                fontSize={fontSize}
              />
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Book not found</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">The book you are looking for does not exist or has been removed.</p>
                <Button onClick={() => navigate("/")}>Back to Home</Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Reader Controls - shown when controls are visible */}
      <div className={`fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'}`}>
        <div className="flex items-center space-x-4">
          <Tabs defaultValue="font">
            <TabsList className="grid grid-cols-3 h-9 w-36">
              <TabsTrigger value="font" className="h-7">
                <Type className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="theme" className="h-7">
                {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </TabsTrigger>
              <TabsTrigger value="audio" className="h-7">
                <Volume2 className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
            <TabsContent value="font" className="absolute bottom-16 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-t-lg p-4 w-80">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Font Size</h3>
                  <div className="flex items-center">
                    <span className="text-xs mr-2">A</span>
                    <Slider
                      value={[fontSize]}
                      min={12}
                      max={24}
                      step={1}
                      onValueChange={handleFontSizeChange}
                      className="flex-1"
                    />
                    <span className="text-base ml-2">A</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="theme" className="absolute bottom-16 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-t-lg p-4 w-80">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Theme</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant={!isDark ? "default" : "outline"} 
                      onClick={() => !isDark || toggleTheme()}
                      className="justify-start"
                    >
                      <Sun className="h-4 w-4 mr-2" /> Light
                    </Button>
                    <Button 
                      variant={isDark ? "default" : "outline"} 
                      onClick={() => isDark || toggleTheme()}
                      className="justify-start"
                    >
                      <Moon className="h-4 w-4 mr-2" /> Dark
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="audio" className="absolute bottom-16 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-t-lg p-4 w-80">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Text-to-Speech</h3>
                  <Button className="w-full">
                    Start Reading Aloud
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400 mr-3">
            Page {currentPage} of {totalPages}
          </span>
          <div className="w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-500 rounded-full" 
              style={{ width: `${(currentPage / totalPages) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={goToPrevPage} disabled={currentPage <= 1}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={goToNextPage} disabled={currentPage >= totalPages}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
