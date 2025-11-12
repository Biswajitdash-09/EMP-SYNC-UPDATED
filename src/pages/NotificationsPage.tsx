import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, ArrowLeft, Trash2, CheckCheck, Filter } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import NotificationItem from '@/components/dashboard/notifications/NotificationItem';
import NotificationFilters from '@/components/dashboard/notifications/NotificationFilters';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    filter,
    categoryFilter,
    setFilter,
    setCategoryFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications
  } = useNotifications();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-2">
                <Bell className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold">Notifications</h1>
                {unreadCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Mark all read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllNotifications}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear all
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6">
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger 
                value="all" 
                onClick={() => setFilter('all')}
              >
                All
                {filter === 'all' && notifications.length > 0 && (
                  <span className="ml-2 text-xs">({notifications.length})</span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="unread"
                onClick={() => setFilter('unread')}
              >
                Unread
                {unreadCount > 0 && (
                  <span className="ml-2 text-xs">({unreadCount})</span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="important"
                onClick={() => setCategoryFilter('high')}
              >
                Important
              </TabsTrigger>
              <TabsTrigger 
                value="archived"
                onClick={() => setFilter('read')}
              >
                Read
              </TabsTrigger>
            </TabsList>

            {/* Filter Section */}
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <NotificationFilters
                filter={filter}
                categoryFilter={categoryFilter}
                unreadCount={unreadCount}
                onFilterChange={setFilter}
                onCategoryFilterChange={setCategoryFilter}
                onMarkAllAsRead={markAllAsRead}
                onClearAll={clearAllNotifications}
              />
            </div>

            <TabsContent value="all" className="mt-0 space-y-2">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Bell className="w-16 h-16 text-muted-foreground/40 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                  <p className="text-muted-foreground">
                    You're all caught up! Check back later for updates.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onDelete={deleteNotification}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="unread" className="mt-0 space-y-2">
              {notifications.filter(n => n.unread).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <CheckCheck className="w-16 h-16 text-muted-foreground/40 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                  <p className="text-muted-foreground">
                    You have no unread notifications.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications
                    .filter(n => n.unread)
                    .map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                      />
                    ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="important" className="mt-0 space-y-2">
              {notifications.filter(n => n.priority === 'high').length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Bell className="w-16 h-16 text-muted-foreground/40 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No important notifications</h3>
                  <p className="text-muted-foreground">
                    You have no high-priority notifications.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications
                    .filter(n => n.priority === 'high')
                    .map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                      />
                    ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="archived" className="mt-0 space-y-2">
              {notifications.filter(n => !n.unread).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Bell className="w-16 h-16 text-muted-foreground/40 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No read notifications</h3>
                  <p className="text-muted-foreground">
                    Read notifications will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications
                    .filter(n => !n.unread)
                    .map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                      />
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default NotificationsPage;
