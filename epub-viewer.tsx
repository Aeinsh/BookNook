import { useState, useEffect, useRef } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';

// EPUB.js is loaded from CDN
declare global {
  interface Window {
    ePub: any;
  }
}

interface EPUBViewerProps {
  fileUrl: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  onTotalPagesChange: (total: number) => void;
  fontSize: number;
}

export default function EPUBViewer({ 
  fileUrl, 
  currentPage, 
  onPageChange, 
  onTotalPagesChange,
  fontSize 
}: EPUBViewerProps) {
  const [book, setBook] = useState<any>(null);
  const [rendition, setRendition] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const viewerRef = useRef<HTMLDivElement>(null);
  const [totalPages, setTotalPages] = useState(0);
  
  // Mock data for book chapters to display in the table of contents
  const chapters = [
    "Chapter 1", "Chapter 2", "Chapter 3", "Chapter 4", "Chapter 5",
    "Chapter 6", "Chapter 7", "Chapter 8", "Chapter 9", "Chapter 10"
  ];

  // Load EPUB reader script dynamically
  useEffect(() => {
    const loadEpubScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.ePub) {
          resolve();
          return;
        }

        // Remove any existing script to prevent conflicts
        const existingScript = document.getElementById('epub-script');
        if (existingScript) {
          document.head.removeChild(existingScript);
        }

        const script = document.createElement('script');
        script.id = 'epub-script';
        script.src = 'https://cdn.jsdelivr.net/npm/epubjs/dist/epub.min.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load ePub.js'));
        document.head.appendChild(script);
      });
    };

    const initializeReader = async () => {
      try {
        setIsLoading(true);
        await loadEpubScript();
        if (!window.ePub) {
          throw new Error('ePub.js failed to initialize');
        }
      } catch (err) {
        console.error('Error loading ePub.js:', err);
        setError('Error loading the EPUB reader. Please try again later.');
        setIsLoading(false);
      }
    };

    initializeReader();
  }, [loadAttempts]);

  // Initialize EPUB book
  useEffect(() => {
    if (!window.ePub || !viewerRef.current) return;

    let isMounted = true;
    let bookInstance: any = null;
    let renditionInstance: any = null;

    const initBook = async () => {
      try {
        // Create a new EPUB book
        bookInstance = window.ePub(fileUrl);
        
        // Handle opening errors
        bookInstance.on('openFailed', (err: any) => {
          if (isMounted) {
            console.error('Error opening EPUB book:', err);
            setError('Error opening the EPUB book. The file might be corrupted or in an unsupported format.');
            setIsLoading(false);
          }
        });

        // Initialize the rendition
        renditionInstance = bookInstance.renderTo(viewerRef.current, {
          width: '100%',
          height: '80vh',
          spread: 'none',
        });

        // Set font size
        renditionInstance.themes.fontSize(`${fontSize}px`);
        
        if (isMounted) {
          setBook(bookInstance);
          setRendition(renditionInstance);
        }

        // When book is ready, estimate total pages
        await bookInstance.ready;
        
        if (!isMounted) return;

        try {
          await bookInstance.locations.generate(1024);
          const totalLocations = bookInstance.locations.total;
          
          if (isMounted) {
            setTotalPages(totalLocations || 100); // Fallback to 100 if locations can't be determined
            onTotalPagesChange(totalLocations || 100);
            setIsLoading(false);
          }

          // Display the first page
          renditionInstance.display();
        } catch (locError) {
          console.error('Error generating locations:', locError);
          if (isMounted) {
            // Still show the book even if locations fail
            setTotalPages(100); // Default value
            onTotalPagesChange(100);
            setIsLoading(false);
            renditionInstance.display();
          }
        }
      } catch (err) {
        console.error('Error initializing EPUB book:', err);
        if (isMounted) {
          setError('Error loading the EPUB book. Please try again later.');
          setIsLoading(false);
        }
      }
    };

    initBook();

    // Clean up
    return () => {
      isMounted = false;
      if (renditionInstance) {
        try {
          renditionInstance.destroy();
        } catch (e) {
          console.error('Error destroying rendition:', e);
        }
      }
      if (bookInstance) {
        try {
          bookInstance.destroy();
        } catch (e) {
          console.error('Error destroying book:', e);
        }
      }
    };
  }, [fileUrl, fontSize, onTotalPagesChange, window.ePub, loadAttempts]);

  // Update font size when it changes
  useEffect(() => {
    if (rendition) {
      try {
        rendition.themes.fontSize(`${fontSize}px`);
      } catch (e) {
        console.error('Error updating font size:', e);
      }
    }
  }, [fontSize, rendition]);

  // Navigate to current page
  useEffect(() => {
    if (rendition && book && book.locations && book.locations.total) {
      try {
        const percentage = currentPage / totalPages;
        const location = book.locations.cfiFromPercentage(percentage);
        rendition.display(location);
      } catch (e) {
        console.error('Error navigating to page:', e);
      }
    }
  }, [currentPage, rendition, book, totalPages]);

  // Setup navigation listeners
  useEffect(() => {
    if (!rendition) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentPage > 1) {
        onPageChange(currentPage - 1);
      } else if (e.key === 'ArrowRight' && currentPage < totalPages) {
        onPageChange(currentPage + 1);
      }
    };

    try {
      rendition.on('keydown', handleKeyDown);
    } catch (e) {
      console.error('Error setting up rendition keydown listener:', e);
    }
    
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      try {
        if (rendition) {
          rendition.off('keydown', handleKeyDown);
        }
      } catch (e) {
        console.error('Error removing rendition keydown listener:', e);
      }
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPage, totalPages, rendition, onPageChange]);

  const handleReload = () => {
    setError(null);
    setIsLoading(true);
    setLoadAttempts(prev => prev + 1);
  };

  // Display error fallback
  if (error) {
    return (
      <div className="flex flex-row h-full">
        {/* Error display */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
            <Button
              onClick={handleReload}
              className="bg-primary-600 hover:bg-primary-700 text-white"
            >
              Reload
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Display loading or book
  return (
    <div className="flex flex-row h-full">
      {/* Main content */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Skeleton className="w-3/4 h-[70vh] rounded-lg" />
            <div className="mt-4 text-center">
              <p className="text-gray-500 dark:text-gray-400">Loading book...</p>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div 
              ref={viewerRef} 
              className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
            />
            
            <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
