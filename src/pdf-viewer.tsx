import { useState, useEffect, useRef } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/types/src/display/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

// Configure PDF.js
// Use a workaround for PDF.js worker initialization
if (typeof window !== 'undefined') {
  // @ts-ignore - The types don't fully match the runtime behavior
  pdfjs.GlobalWorkerOptions.workerSrc = '';
}

interface PDFViewerProps {
  fileUrl: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  onTotalPagesChange: (total: number) => void;
  fontSize: number;
}

export default function PDFViewer({ 
  fileUrl, 
  currentPage, 
  onPageChange, 
  onTotalPagesChange,
  fontSize 
}: PDFViewerProps) {
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [pageRendering, setPageRendering] = useState(false);
  const [pageText, setPageText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [outline, setOutline] = useState<any[]>([]);
  const [loadAttempts, setLoadAttempts] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Generate chapter outlines if none are available from the PDF
  const chapters = [
    "Chapter 1", "Chapter 2", "Chapter 3", "Chapter 4", "Chapter 5",
    "Chapter 6", "Chapter 7", "Chapter 8", "Chapter 9", "Chapter 10"
  ];
  
  // Load PDF document
  useEffect(() => {
    const loadPDF = async () => {
      try {
        setPageRendering(true);
        
        // Clear previous document if any
        setPdfDocument(null);
        
        const loadingTask = pdfjs.getDocument(fileUrl);
        const pdf = await loadingTask.promise;
        
        // Get document outline (table of contents)
        try {
          const outline = await pdf.getOutline();
          if (outline && outline.length > 0) {
            setOutline(outline);
          }
        } catch (outlineErr) {
          console.log('No outline available or error fetching outline:', outlineErr);
          // Will fall back to generated chapters
        }
        
        setPdfDocument(pdf);
        onTotalPagesChange(pdf.numPages);
      } catch (err) {
        console.error('Error loading PDF:', err);
        setError('Error loading the PDF. Please try again later.');
        setPageRendering(false);
      }
    };

    loadPDF();

    return () => {
      // Clean up resources if needed
    };
  }, [fileUrl, onTotalPagesChange, loadAttempts]);

  // Render current page when it changes
  useEffect(() => {
    const renderPage = async (pageNum: number) => {
      if (!pdfDocument) return;
      
      try {
        setPageRendering(true);
        const page = await pdfDocument.getPage(pageNum);
        
        // Extract text content for accessibility
        const textContent = await page.getTextContent();
        const text = textContent.items
          .map(item => 'str' in item ? item.str : '')
          .join(' ');
        setPageText(text);
        
        // Render the page on canvas
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const context = canvas.getContext('2d');
        if (!context) return;
        
        // Calculate scale to fit the page in the viewer
        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        
        await page.render(renderContext).promise;
        setPageRendering(false);
      } catch (err) {
        console.error('Error rendering page:', err);
        setPageRendering(false);
        setError('Error rendering the page. Please try again.');
      }
    };

    if (pdfDocument && currentPage > 0 && currentPage <= pdfDocument.numPages) {
      renderPage(currentPage);
    }
  }, [pdfDocument, currentPage]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentPage > 1) {
        onPageChange(currentPage - 1);
      } else if (e.key === 'ArrowRight' && pdfDocument && currentPage < pdfDocument.numPages) {
        onPageChange(currentPage + 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPage, pdfDocument, onPageChange]);

  // Handle chapter navigation
  const navigateToChapter = (index: number) => {
    if (!pdfDocument) return;
    
    // If we have a real PDF outline with destinations
    if (outline && outline.length > 0 && outline[index]?.dest) {
      pdfDocument.getDestination(outline[index].dest).then((dest) => {
        if (Array.isArray(dest) && dest.length > 0 && typeof dest[0] === 'object') {
          pdfDocument!.getPageIndex(dest[0]).then(index => {
            const pageNumber = index + 1;
            onPageChange(pageNumber);
          }).catch(err => {
            console.error('Error getting page index:', err);
            // Fallback to first page
            onPageChange(1);
          });
        }
      }).catch(err => {
        console.error('Error navigating to destination:', err);
        // Fallback to approximation
        const targetPage = Math.max(1, Math.floor((index / (outline.length - 1)) * pdfDocument!.numPages));
        onPageChange(targetPage);
      });
    } else {
      // Simple approximation if no real outline
      const totalPages = pdfDocument.numPages;
      const chaptersCount = chapters.length;
      const pagesPerChapter = Math.floor(totalPages / chaptersCount);
      const targetPage = Math.min(totalPages, Math.max(1, (index * pagesPerChapter) + 1));
      onPageChange(targetPage);
    }
  };

  const handleReload = () => {
    setError(null);
    setLoadAttempts(prev => prev + 1);
  };

  // Display chapters from PDF outline or generated ones
  const displayChapters = outline.length > 0 
    ? outline.map(item => item.title || 'Unnamed Section')
    : chapters;

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

  return (
    <div className="flex flex-row h-full">
      {/* Main content */}
      <div className="flex-1">
        {/* Accessible but visually hidden text */}
        <div className="sr-only" aria-live="polite">
          {pageText}
        </div>

        {/* PDF rendering */}
        <div className="flex flex-col items-center p-6" style={{ fontSize: `${fontSize}px` }}>
          {pageRendering || !pdfDocument ? (
            <div className="flex flex-col items-center justify-center w-full">
              <Skeleton className="w-3/4 h-[70vh] rounded-lg" />
              <p className="mt-4 text-gray-500 dark:text-gray-400">Loading document...</p>
            </div>
          ) : (
            <>
              <div className="max-h-[75vh] overflow-auto">
                <canvas 
                  ref={canvasRef} 
                  className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm"
                />
              </div>
              
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 flex items-center space-x-4">
                <Button 
                  variant="outline" 
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage <= 1}
                  className="px-3 py-1"
                >
                  Previous
                </Button>
                
                <span>Page {currentPage} of {pdfDocument.numPages}</span>
                
                <Button 
                  variant="outline" 
                  onClick={() => onPageChange(Math.min(pdfDocument.numPages, currentPage + 1))}
                  disabled={currentPage >= pdfDocument.numPages}
                  className="px-3 py-1"
                >
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
