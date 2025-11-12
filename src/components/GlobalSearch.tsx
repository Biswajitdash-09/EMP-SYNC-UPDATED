import { useState } from 'react';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from '@/components/ui/command';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { Search, FileText, Users, Calendar, DollarSign, TrendingUp, Bell, Clock, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

const typeIcons = {
  employee: Users,
  leave: Calendar,
  payroll: DollarSign,
  performance: TrendingUp,
  document: FileText,
  notification: Bell,
};

const typeColors = {
  employee: 'text-blue-500',
  leave: 'text-green-500',
  payroll: 'text-purple-500',
  performance: 'text-orange-500',
  document: 'text-cyan-500',
  notification: 'text-pink-500',
};

export const GlobalSearch = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, results, isSearching, recentSearches, saveSearch, clearRecentSearches } = useGlobalSearch();

  const handleSelect = (url: string) => {
    saveSearch(searchQuery);
    onOpenChange(false);
    navigate(url);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search employees, leave requests, documents..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>
          {isSearching ? 'Searching...' : 'No results found.'}
        </CommandEmpty>

        {/* Recent Searches */}
        {!searchQuery && recentSearches.length > 0 && (
          <>
            <CommandGroup heading={
              <div className="flex items-center justify-between">
                <span>Recent Searches</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={clearRecentSearches}
                >
                  Clear
                </Button>
              </div>
            }>
              {recentSearches.map((search, index) => (
                <CommandItem
                  key={index}
                  onSelect={() => setSearchQuery(search)}
                >
                  <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                  {search}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Search Results */}
        {results.length > 0 && (
          <>
            {Object.entries(
              results.reduce((acc, result) => {
                if (!acc[result.type]) acc[result.type] = [];
                acc[result.type].push(result);
                return acc;
              }, {} as Record<string, typeof results>)
            ).map(([type, items]) => (
              <CommandGroup
                key={type}
                heading={type.charAt(0).toUpperCase() + type.slice(1) + 's'}
              >
                {items.map((result) => {
                  const Icon = typeIcons[result.type];
                  const colorClass = typeColors[result.type];

                  return (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleSelect(result.url)}
                      className="flex items-start gap-3 py-3"
                    >
                      <Icon className={`w-4 h-4 mt-1 ${colorClass}`} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{result.title}</div>
                        <div className="text-sm text-muted-foreground truncate">
                          {result.subtitle}
                        </div>
                        {result.date && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(result.date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
};

export const GlobalSearchTrigger = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search anything...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <GlobalSearch open={open} onOpenChange={setOpen} />
    </>
  );
};
