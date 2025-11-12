import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: 'employee' | 'leave' | 'payroll' | 'performance' | 'document' | 'notification';
  url: string;
  date?: string;
}

export const useGlobalSearch = () => {
  const { user, profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recent-searches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Save search to recent searches
  const saveSearch = (query: string) => {
    if (!query.trim()) return;
    
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recent-searches', JSON.stringify(updated));
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent-searches');
  };

  // Perform search
  useEffect(() => {
    if (!searchQuery.trim() || !user) {
      setResults([]);
      return;
    }

    const performSearch = async () => {
      setIsSearching(true);
      const query = searchQuery.toLowerCase();
      const allResults: SearchResult[] = [];

      try {
        // Search employees (admin only)
        if (profile?.is_active) {
          const { data: employees } = await supabase
            .from('employees')
            .select('id, full_name, email, position, department')
            .or(`full_name.ilike.%${query}%,email.ilike.%${query}%,position.ilike.%${query}%,department.ilike.%${query}%`)
            .limit(5);

          if (employees) {
            allResults.push(
              ...employees.map((emp) => ({
                id: emp.id,
                title: emp.full_name,
                subtitle: `${emp.position} - ${emp.department}`,
                type: 'employee' as const,
                url: `/employees?id=${emp.id}`,
              }))
            );
          }
        }

        // Search leave requests
        const { data: leaves } = await supabase
          .from('leave_requests')
          .select('id, leave_type, start_date, end_date, status')
          .eq('user_id', user.id)
          .or(`leave_type.ilike.%${query}%,status.ilike.%${query}%`)
          .limit(5);

        if (leaves) {
          allResults.push(
            ...leaves.map((leave) => ({
              id: leave.id,
              title: `${leave.leave_type} Leave`,
              subtitle: `${leave.start_date} to ${leave.end_date} - ${leave.status}`,
              type: 'leave' as const,
              url: `/leave-management?id=${leave.id}`,
              date: leave.start_date,
            }))
          );
        }

        // Search notifications
        const { data: notifications } = await supabase
          .from('notifications')
          .select('id, title, message, created_at, type')
          .eq('user_id', user.id)
          .or(`title.ilike.%${query}%,message.ilike.%${query}%`)
          .order('created_at', { ascending: false })
          .limit(5);

        if (notifications) {
          allResults.push(
            ...notifications.map((notif) => ({
              id: notif.id,
              title: notif.title,
              subtitle: notif.message.substring(0, 60) + '...',
              type: 'notification' as const,
              url: '/notifications',
              date: notif.created_at,
            }))
          );
        }

        // Search documents
        const { data: documents } = await supabase
          .from('documents')
          .select('id, document_name, document_type, upload_date')
          .eq('user_id', user.id)
          .or(`document_name.ilike.%${query}%,document_type.ilike.%${query}%`)
          .limit(5);

        if (documents) {
          allResults.push(
            ...documents.map((doc) => ({
              id: doc.id,
              title: doc.document_name,
              subtitle: `${doc.document_type}`,
              type: 'document' as const,
              url: `/employee-dashboard?tab=documents`,
              date: doc.upload_date,
            }))
          );
        }

        setResults(allResults);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, user, profile]);

  return {
    searchQuery,
    setSearchQuery,
    results,
    isSearching,
    recentSearches,
    saveSearch,
    clearRecentSearches,
  };
};
