import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useDarkMode } from "@/lib/use-dark-mode";
import { cn } from "@/lib/utils";
import { 
  BookOpen, Search, Moon, Sun, Menu, X, Home, Compass, 
  Flame, Lightbulb, History, Beaker, Rocket, BookText, 
  MoreHorizontal, Check, Bookmark, ChevronRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const { isDark, toggleTheme } = useDarkMode();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [, navigate] = useLocation();

  // Get user's bookmarks count for the badge
  const { data: bookmarks } = useQuery<any[]>({
    queryKey: ["/api/bookmarks"],
    enabled: !!user,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [useLocation()[0]]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar');
      if (isSidebarOpen && sidebar && !sidebar.contains(event.target as Node)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            className="md:hidden mr-2 text-gray-700 dark:text-gray-300"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <a href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">Book<span className="text-secondary-500">Nook</span></span>
          </a>
        </div>
        
        <div className="hidden md:flex flex-grow max-w-2xl mx-8">
          <form onSubmit={handleSearch} className="relative w-full">
            <Input
              type="search"
              placeholder="Search books, authors, genres..."
              className="w-full pl-4 pr-10 py-2 rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit"
              variant="ghost" 
              className="absolute right-0 top-0 h-full px-3 rounded-r-full"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            onClick={toggleTheme}
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          {!user ? (
            <div>
              <a href="/auth">
                <Button variant="outline" className="mr-2 hidden sm:inline-flex">Log in</Button>
              </a>
              <a href="/auth">
                <Button>Sign up</Button>
              </a>
            </div>
          ) : (
            <div className="flex items-center">
              <a href="/explore?bookmarked=true" className="relative text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {bookmarks && bookmarks.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 text-xs bg-amber-500 text-white rounded-full flex items-center justify-center">
                    {bookmarks.length}
                  </span>
                )}
              </a>
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none" asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="https://ui-avatars.com/api/?name=User&background=3b82f6&color=fff" alt={user.username} />
                      <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-4 py-2 text-sm font-medium">
                    {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.username}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <a href="/profile" className="flex cursor-pointer w-full">
                      Profile
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="/explore?reading=current" className="flex cursor-pointer w-full">
                      My Books
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="/explore?reading=history" className="flex cursor-pointer w-full">
                      Reading History
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="/settings" className="flex cursor-pointer w-full">
                      Settings
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600 dark:text-red-400 cursor-pointer"
                    onClick={handleLogout}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
      
      {/* Mobile search bar */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="relative">
          <Input
            type="search"
            placeholder="Search books, authors, genres..."
            className="w-full pl-4 pr-10 py-2 rounded-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button 
            type="submit"
            variant="ghost" 
            className="absolute right-0 top-0 h-full px-3 rounded-r-full"
          >
            <Search className="h-4 w-4" />
          </Button>
        </form>
      </div>

      {/* Mobile Sidebar */}
      <div 
        id="mobile-sidebar"
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out md:hidden",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col overflow-y-auto">
          <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">Book<span className="text-secondary-500">Nook</span></span>
            <button 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <nav className="flex-1 px-4 py-4">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold px-2 mb-3">Browse</h3>
            <ul className="space-y-1">
              <li>
                <a href="/" className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-lg",
                  useLocation()[0] === "/" 
                    ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-gray-700"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}>
                  <Home className="w-5 h-5 mr-3" />
                  <span>Home</span>
                </a>
              </li>
              <li>
                <a href="/explore" className={cn(
                  "flex items-center px-2 py-2 text-sm font-medium rounded-lg",
                  useLocation()[0] === "/explore" 
                    ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-gray-700"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}>
                  <Compass className="w-5 h-5 mr-3" />
                  <span>Explore</span>
                </a>
              </li>
              <li>
                <a href="/explore?sort=trending" className="flex items-center px-2 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Flame className="w-5 h-5 mr-3" />
                  <span>Trending</span>
                </a>
              </li>
              <li>
                <a href="/explore?recommended=true" className="flex items-center px-2 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Lightbulb className="w-5 h-5 mr-3" />
                  <span>Recommended</span>
                </a>
              </li>
            </ul>
            
            <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold px-2 mb-3 mt-6">Categories</h3>
            <ul className="space-y-1">
              <li>
                <a href="/category/History" className="flex items-center px-2 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <History className="w-5 h-5 mr-3" />
                  <span>History</span>
                </a>
              </li>
              <li>
                <a href="/category/Science" className="flex items-center px-2 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Beaker className="w-5 h-5 mr-3" />
                  <span>Science</span>
                </a>
              </li>
              <li>
                <a href="/category/Science%20Fiction" className="flex items-center px-2 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Rocket className="w-5 h-5 mr-3" />
                  <span>Sci-Fi</span>
                </a>
              </li>
              <li>
                <a href="/category/Classic" className="flex items-center px-2 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <BookText className="w-5 h-5 mr-3" />
                  <span>Literature</span>
                </a>
              </li>
              <li>
                <a href="/explore" className="flex items-center justify-between px-2 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <div className="flex items-center">
                    <MoreHorizontal className="w-5 h-5 mr-3" />
                    <span>More Categories</span>
                  </div>
                  <ChevronRight className="text-xs text-gray-400" />
                </a>
              </li>
            </ul>
            
            {user && (
              <>
                <h3 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold px-2 mb-3 mt-6">Your Library</h3>
                <ul className="space-y-1">
                  <li>
                    <a href="/explore?reading=current" className="flex items-center px-2 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <BookOpen className="w-5 h-5 mr-3" />
                      <span>Currently Reading</span>
                    </a>
                  </li>
                  <li>
                    <a href="/explore?reading=completed" className="flex items-center px-2 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Check className="w-5 h-5 mr-3" />
                      <span>Read</span>
                    </a>
                  </li>
                  <li>
                    <a href="/explore?bookmarked=true" className="flex items-center px-2 py-2 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Bookmark className="w-5 h-5 mr-3" />
                      <span>Want to Read</span>
                    </a>
                  </li>
                </ul>
              </>
            )}
          </nav>
          
          <div className="p-4 mt-auto border-t border-gray-200 dark:border-gray-700">
            <a href="#" className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Help Center</span>
            </a>
            <a href="#" className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 mt-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Settings</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
