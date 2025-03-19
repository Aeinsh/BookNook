import React from 'react';
import { Book, ReadingProgress } from "@shared/schema";

export const getBookCoverFallback = (book: Book): string => {
  // If cover URL is missing, generate a colored background with book title
  if (!book.coverUrl) {
    const colors = [
      "bg-blue-600",
      "bg-green-600",
      "bg-red-600",
      "bg-purple-600",
      "bg-yellow-600",
      "bg-pink-600",
      "bg-indigo-600",
    ];
    
    // Use the book ID to consistently get the same color for a book
    const colorIndex = book.id % colors.length;
    return colors[colorIndex];
  }
  
  return "";
};

export const getCategoryColor = (category: string): string => {
  const categoryColors: Record<string, string> = {
    "Science Fiction": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    "Classic": "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    "Romance": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
    "Adventure": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    "Fantasy": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    "Mystery": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    "Horror": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    "Biography": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    "History": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    "Philosophy": "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
    "Gothic": "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300",
    "Strategy": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
    "Satire": "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
    "Historical Fiction": "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300",
    "Literary Fiction": "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
    "Epic Poetry": "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900 dark:text-fuchsia-300",
    "Philosophical": "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300",
  };
  
  return categoryColors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
};

export const formatReadingProgress = (progress: ReadingProgress, book?: Book): string => {
  const percent = progress.progress;
  
  if (progress.currentPage && progress.totalPages) {
    return `Page ${progress.currentPage} of ${progress.totalPages} (${percent}%)`;
  }
  
  return `${percent}% complete`;
};

export const calculateTimeToRead = (book: Book): string => {
  // Average reading speed is about 250 words per minute
  // Average page has about 250-300 words
  const pagesPerHour = 60; // Roughly 1 page per minute
  
  if (!book.pages) {
    return "Unknown";
  }
  
  const timeInHours = book.pages / pagesPerHour;
  
  if (timeInHours < 1) {
    return `${Math.round(timeInHours * 60)} min`;
  }
  
  const hours = Math.floor(timeInHours);
  const minutes = Math.round((timeInHours - hours) * 60);
  
  if (minutes === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  
  return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${minutes} min`;
};

export const getStarRating = (rating: number = 0): JSX.Element[] => {
  const stars: JSX.Element[] = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  // Add full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(React.createElement("span", { key: i, className: "text-yellow-500" }, "★"));
  }
  
  // Add half star if needed
  if (hasHalfStar) {
    stars.push(React.createElement("span", { key: "half", className: "text-yellow-500" }, "★"));
  }
  
  // Add empty stars
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(React.createElement("span", { key: `empty-${i}`, className: "text-gray-300 dark:text-gray-600" }, "★"));
  }
  
  return stars;
};
