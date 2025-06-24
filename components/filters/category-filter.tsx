import { ROOM_CATEGORIES, getAllGenres } from "@/lib/room-categories";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface CategoryFilterProps {
  selectedCategories: string[];
  selectedGenres: string[];
  onCategoryToggle: (categoryId: string) => void;
  onGenreToggle: (genreId: string) => void;
  onClearFilters: () => void;
}

export function CategoryFilter({
  selectedCategories,
  selectedGenres,
  onCategoryToggle,
  onGenreToggle,
  onClearFilters
}: CategoryFilterProps) {
  const allGenres = getAllGenres();
  const hasFilters = selectedCategories.length > 0 || selectedGenres.length > 0;

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Filter by Category</h3>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Category Filters */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-3">Categories</h4>
        <div className="flex flex-wrap gap-2">
          {ROOM_CATEGORIES.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            const Icon = category.icon;
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryToggle(category.id)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg border transition-all
                  ${isSelected 
                    ? 'bg-purple-600 border-purple-500 text-white' 
                    : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Popular Genres */}
      <div>
        <h4 className="text-sm font-medium text-gray-400 mb-3">Popular Genres</h4>
        <div className="flex flex-wrap gap-2">
          {allGenres
            .filter(genre => genre.isPopular)
            .slice(0, 12)
            .map((genre) => {
              const isSelected = selectedGenres.includes(genre.id);
              
              return (
                <Badge
                  key={genre.id}
                  variant={isSelected ? "default" : "secondary"}
                  className={`
                    cursor-pointer transition-all
                    ${isSelected 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }
                  `}
                  onClick={() => onGenreToggle(genre.id)}
                >
                  {genre.name}
                </Badge>
              );
            })}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasFilters && (
        <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
          <h4 className="text-sm font-medium text-gray-400 mb-2">Active Filters</h4>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map(categoryId => {
              const category = ROOM_CATEGORIES.find(c => c.id === categoryId);
              return category ? (
                <Badge 
                  key={categoryId}
                  variant="outline" 
                  className="border-purple-500 text-purple-400"
                >
                  {category.name}
                </Badge>
              ) : null;
            })}
            {selectedGenres.map(genreId => {
              const genre = allGenres.find(g => g.id === genreId);
              return genre ? (
                <Badge 
                  key={genreId}
                  variant="outline" 
                  className="border-blue-500 text-blue-400"
                >
                  {genre.name}
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
