import { Link } from "wouter";
import { Category } from "@shared/schema";

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/category/${encodeURIComponent(category.name)}`}>
      <a className="relative overflow-hidden rounded-xl h-32 group">
        <div className="absolute inset-0 bg-gray-900 bg-opacity-60 group-hover:bg-opacity-50 transition-all duration-200 flex items-center justify-center p-4">
          <h3 className="text-white text-lg font-semibold text-center">{category.name}</h3>
        </div>
        {category.imageUrl ? (
          <img 
            src={category.imageUrl} 
            alt={category.name} 
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-200"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary-700 to-primary-500 transform group-hover:scale-105 transition-transform duration-200" />
        )}
      </a>
    </Link>
  );
}
