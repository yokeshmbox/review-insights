
'use client';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RechartsTooltip, Cell, LabelList } from 'recharts';
import type { Review } from './review-dashboard';
import { Star, TrendingUp, ThumbsUp, AlertTriangle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RatingCategory } from '@/ai/schemas';
import { StarRating } from './ui/star-rating';

interface SentimentSummaryCardProps {
  reviews: Review[];
  consolidatedRating: number | null;
}

const categoryOrder: RatingCategory[] = ['BEST', 'GOOD', 'FARE', 'BAD'];
const categoryColors: Record<RatingCategory, string> = {
  'BEST': 'hsl(var(--chart-1))',
  'GOOD': 'hsl(120 35% 75%)', // A lighter green than chart-1
  'FARE': 'hsl(var(--chart-4))',
  'BAD': 'hsl(var(--chart-2))',
  'Other': 'hsl(var(--muted-foreground))'
};

export function SentimentSummaryCard({ reviews, consolidatedRating }: SentimentSummaryCardProps) {
  const categoryCounts = useMemo(() => {
    const counts = new Map<RatingCategory, number>();
    categoryOrder.forEach(cat => counts.set(cat, 0));
    reviews.forEach(review => {
      if (review.sentiment) {
        counts.set(review.sentiment, (counts.get(review.sentiment) || 0) + 1);
      }
    });
    return Array.from(counts.entries()).map(([name, value]) => ({ name, value }));
  }, [reviews]);
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-card border rounded-md shadow-lg">
          <p className="label font-semibold">{label}</p>
          <p className="intro">{`Count: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };
  
  const ratingValue = consolidatedRating !== null ? consolidatedRating : 0;

  const ratingFeedback = useMemo(() => {
    if (ratingValue >= 4.5) return { title: "Excellent Guest Feedback!", Icon: TrendingUp, description: "Guests are loving their stay. Keep up the great work!", color: "text-accent" };
    if (ratingValue >= 4.0) return { title: "Great Job!", Icon: ThumbsUp, description: "Overall, guests are very satisfied. A few small tweaks could make it perfect.", color: "text-lime-500" };
    if (ratingValue >= 3.0) return { title: "Good, with Room to Grow", Icon: ThumbsUp, description: "Feedback is generally positive, but there are clear areas for improvement.", color: "text-yellow-500" };
    if (ratingValue >= 2.0) return { title: "Attention Needed", Icon: AlertTriangle, description: "Significant areas require your focus to improve guest experience.", color: "text-orange-500" };
    return { title: "Urgent Review Required", Icon: AlertCircle, description: "Immediate action is needed to address critical guest feedback.", color: "text-red-500" };
  }, [ratingValue]);

  return (
    <Card className="shadow-lg bg-secondary/20 border-border/50">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
            <CardTitle className="text-2xl">Guest Sentiment Snapshot</CardTitle>
            <CardDescription>A high-level look at guest satisfaction.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-secondary/30 text-center">
                <ratingFeedback.Icon className={cn("h-16 w-16 mb-2", ratingFeedback.color)} />
                <p className={cn("text-xl font-bold mt-2", ratingFeedback.color)}>{ratingFeedback.title}</p>
                <div className="flex items-center justify-center gap-6 mt-4">
                    <div className="flex flex-col items-center">
                        <span className="text-5xl font-bold text-primary">{ratingValue.toFixed(1)}</span>
                        <div className="flex items-center mt-1">
                          <StarRating rating={ratingValue} />
                        </div>
                    </div>
                    <div className="border-l border-border/50 h-16"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-5xl font-bold text-primary">{reviews.length}</span>
                        <div className="flex items-center mt-1 text-muted-foreground text-sm">
                            Total Reviews
                        </div>
                    </div>
                </div>
                 <p className="text-sm text-muted-foreground mt-4 h-10">{ratingFeedback.description}</p>
          </div>
          <div className="h-64 w-full md:col-span-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryCounts} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 14, fill: 'hsl(var(--muted-foreground))'}} width={60} />
                <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent) / 0.2)' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    <LabelList dataKey="value" position="right" className="fill-foreground font-semibold" />
                    {categoryCounts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={categoryColors[entry.name as RatingCategory]} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
