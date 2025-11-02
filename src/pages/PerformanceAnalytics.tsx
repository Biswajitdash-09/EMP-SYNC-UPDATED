import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Calendar, MessageSquare, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import ScheduleReviewModal from '@/components/performance/ScheduleReviewModal';
import PerformanceStatsCards from '@/components/performance/PerformanceStatsCards';
import PerformanceTable from '@/components/performance/PerformanceTable';
import GoalsSection from '@/components/performance/GoalsSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { usePerformanceCore } from '@/hooks/performance/usePerformanceCore';
import { useMyPerformanceReviews, useCreatePerformanceReview, useUpdatePerformanceReview } from '@/hooks/performance/usePerformanceReviewsQuery';
import { useMyPerformanceGoals } from '@/hooks/performance/usePerformanceGoalsQuery';
import { useMyPerformanceFeedback, useCreatePerformanceFeedback } from '@/hooks/performance/usePerformanceFeedbackQuery';
const PerformanceAnalytics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { performanceData } = usePerformanceCore();
  const { data: reviews, isLoading: reviewsLoading } = useMyPerformanceReviews();
  const { data: goals, isLoading: goalsLoading } = useMyPerformanceGoals();
  const { data: feedback, isLoading: feedbackLoading } = useMyPerformanceFeedback();
  const createReview = useCreatePerformanceReview();
  const updateReview = useUpdatePerformanceReview();
  const createFeedback = useCreatePerformanceFeedback();

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [newFeedback, setNewFeedback] = useState({
    fromEmployee: 'Manager',
    toEmployee: '',
    type: 'Positive' as const,
    comments: '',
    isAnonymous: false
  });

  // Calculate stats from real data
  const stats = useMemo(() => {
    const avgScore = performanceData.reduce((acc, emp) => acc + emp.currentScore, 0) / performanceData.length;
    const goalCompletionRate = goals?.filter(g => g.status === 'Completed').length || 0 / (goals?.length || 1) * 100;
    const pendingReviews = reviews?.filter(r => r.status === 'draft').length || 0;
    const topPerformers = performanceData.filter(emp => emp.currentScore >= 4.5).length;

    return {
      averageScore: avgScore,
      goalCompletionRate,
      pendingReviews,
      topPerformers
    };
  }, [performanceData, goals, reviews]);
  
  const handleStartReview = (reviewId: string) => {
    updateReview.mutate({
      id: reviewId,
      updates: { status: 'in_progress' }
    });
  };

  const handleSubmitFeedback = () => {
    if (newFeedback.toEmployee && newFeedback.comments) {
      createFeedback.mutate({
        from_employee_id: null,
        to_employee_id: null,
        from_employee: newFeedback.fromEmployee,
        to_employee: newFeedback.toEmployee,
        type: newFeedback.type,
        comments: newFeedback.comments,
        is_anonymous: newFeedback.isAnonymous
      });
      setNewFeedback({
        fromEmployee: 'Manager',
        toEmployee: '',
        type: 'Positive',
        comments: '',
        isAnonymous: false
      });
    }
  };

  const handleScheduleReview = (review: any) => {
    createReview.mutate({
      employee_id: null,
      reviewer_id: null,
      review_period_start: new Date().toISOString().split('T')[0],
      review_period_end: review.dueDate,
      overall_rating: null,
      strengths: null,
      areas_for_improvement: null,
      goals: review.description,
      comments: null,
      status: 'draft'
    });
    setIsScheduleModalOpen(false);
  };

  const handleCompleteReview = (reviewId: string, score: number, comments: string) => {
    updateReview.mutate({
      id: reviewId,
      updates: {
        status: 'completed',
        overall_rating: score,
        comments: comments
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'draft':
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  return <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/dashboard')} className="bg-yellow-300 hover:bg-yellow-200">
                ← Back to Dashboard
              </Button>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-6 h-6 text-red-600" />
                <h1 className="text-xl font-bold text-gray-900">Performance Analytics</h1>
              </div>
            </div>
            <Button className="bg-red-600 hover:bg-red-700" onClick={() => setIsScheduleModalOpen(true)}>
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Review
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="goals">Goals & KPIs</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <PerformanceStatsCards {...stats} />
            <PerformanceTable data={performanceData} />
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <GoalsSection />
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Reviews</CardTitle>
                <CardDescription>Manage performance review cycles and evaluations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviewsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p className="text-muted-foreground">Loading reviews...</p>
                  </div>
                ) : !reviews || reviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No reviews scheduled yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Your Reviews</h4>
                    <div className="space-y-2">
                      {reviews.map(review => (
                        <div key={review.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h5 className="font-medium">Review Period: {review.review_period_start} to {review.review_period_end}</h5>
                            <Badge className={getStatusColor(review.status)}>
                              {review.status}
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            {review.status === 'draft' && (
                              <Button size="sm" onClick={() => handleStartReview(review.id)} disabled={updateReview.isPending}>
                                {updateReview.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Start Review'}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Feedback and Comments
                </CardTitle>
                <CardDescription>Continuous feedback and performance comments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Give Feedback</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="employee">Employee *</Label>
                        <Select value={newFeedback.toEmployee} onValueChange={value => setNewFeedback(prev => ({
                        ...prev,
                        toEmployee: value
                      }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {performanceData.map(emp => <SelectItem key={emp.id} value={emp.employee}>{emp.employee}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="feedbackType">Feedback Type</Label>
                        <Select value={newFeedback.type} onValueChange={(value: any) => setNewFeedback(prev => ({
                        ...prev,
                        type: value
                      }))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Positive">Positive</SelectItem>
                            <SelectItem value="Constructive">Constructive</SelectItem>
                            <SelectItem value="Recognition">Recognition</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="comments">Comments *</Label>
                        <Textarea id="comments" placeholder="Enter your feedback" value={newFeedback.comments} onChange={e => setNewFeedback(prev => ({
                        ...prev,
                        comments: e.target.value
                      }))} />
                      </div>
                      <Button onClick={handleSubmitFeedback} className="w-full" disabled={createFeedback.isPending}>
                        {createFeedback.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        Submit Feedback
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold">Recent Feedback</h4>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {feedbackLoading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading feedback...</div>
                      ) : !feedback || feedback.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No feedback yet</div>
                      ) : (
                        feedback.map(fb => (
                          <div key={fb.id} className="p-3 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className={fb.type === 'Positive' ? 'text-green-600' : fb.type === 'Constructive' ? 'text-blue-600' : 'text-purple-600'}>
                                {fb.type}
                              </Badge>
                              <span className="text-sm text-gray-500">{new Date(fb.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm mb-2">"{fb.comments}"</p>
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>To: {fb.to_employee}</span>
                              <span>From: {fb.is_anonymous ? 'Anonymous' : fb.from_employee}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance History</CardTitle>
                <CardDescription>Historical performance data and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reviewsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading history...</div>
                  ) : !reviews || reviews.filter(r => r.status === 'completed').length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No completed reviews yet</div>
                  ) : (
                    reviews.filter(r => r.status === 'completed').map(review => (
                      <div key={review.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">Review Period: {review.review_period_start} to {review.review_period_end}</h4>
                          <p className="text-sm text-gray-600">Completed {new Date(review.updated_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">Rating: {review.overall_rating}/5.0</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <ScheduleReviewModal isOpen={isScheduleModalOpen} onClose={() => setIsScheduleModalOpen(false)} onSchedule={handleScheduleReview} />
    </div>;
};
export default PerformanceAnalytics;