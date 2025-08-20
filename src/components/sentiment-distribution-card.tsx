
'use client';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { Review } from './review-dashboard';
import { Smile, Frown, TrendingUp, TrendingDown, MessageCircle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RatingCategory } from '@/ai/schemas';

interface SentimentDistributionCardProps {
  reviews: Review[];
  summary: string;
}

const COLORS: Record<'Positive' | 'Negative', string> = {
  Positive: 'hsl(var(--chart-positive))',
  Negative: 'hsl(var(--chart-negative))',
};

export function SentimentDistributionCard({ reviews, summary }: SentimentDistributionCardProps) {
  const sentimentDistribution = useMemo(() => {
    const counts = {
        Positive: 0,
        Negative: 0,
    };

    reviews.forEach(review => {
      if (review.sentiment === 'BEST' || review.sentiment === 'GOOD') {
          counts.Positive++;
      } else if (review.sentiment === 'FARE' || review.sentiment === 'BAD') {
          counts.Negative++;
      }
    });

    return [
        { name: 'Positive', value: counts.Positive },
        { name: 'Negative', value: counts.Negative },
    ].filter(d => d.value > 0);
  }, [reviews]);
  
  const totalReviews = reviews.length;
  const positiveReviews = sentimentDistribution.find(d => d.name === 'Positive')?.value || 0;
  const negativeReviews = sentimentDistribution.find(d => d.name === 'Negative')?.value || 0;
  
  const positivePercentage = totalReviews > 0 ? (positiveReviews / totalReviews) * 100 : 0;
  const negativePercentage = totalReviews > 0 ? (negativeReviews / totalReviews) * 100 : 0;

  const topPositiveTopic = useMemo(() => {
    const topicRatings: { [key in string]: { total: number, count: number } } = {};
    reviews.filter(r => r.sentiment === 'BEST' || r.sentiment === 'GOOD').forEach(r => {
        if (!topicRatings[r.topic]) topicRatings[r.topic] = { total: 0, count: 0 };
        topicRatings[r.topic].total += r.rating;
        topicRatings[r.topic].count++;
    });
    
    let topTopic = 'N/A';
    let maxAvg = 0;
    for (const topic in topicRatings) {
        const avg = topicRatings[topic].total / topicRatings[topic].count;
        if (avg > maxAvg) {
            maxAvg = avg;
            topTopic = topic;
        }
    }
    return topTopic;

  }, [reviews]);

  const topNegativeTopic = useMemo(() => {
    const topicRatings: { [key in string]: { total: number, count: number } } = {};
    reviews.filter(r => r.sentiment === 'FARE' || r.sentiment === 'BAD').forEach(r => {
        if (!topicRatings[r.topic]) topicRatings[r.topic] = { total: 0, count: 0 };
        topicRatings[r.topic].total += r.rating;
        topicRatings[r.topic].count++;
    });
    
    let topTopic = 'N/A';
    let minAvg = 5;
    for (const topic in topicRatings) {
        const avg = topicRatings[topic].total / topicRatings[topic].count;
        if (avg < minAvg) {
            minAvg = avg;
            topTopic = topic;
        }
    }
    return topTopic;
  }, [reviews]);


  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0];
      const percentage = totalReviews > 0 ? (value / totalReviews) * 100 : 0;
      return (
        <div className="p-2 bg-background/80 backdrop-blur-sm border rounded-md shadow-lg">
          <p className="label font-semibold">{name}</p>
          <p className="intro">{`Count: ${value} (${percentage.toFixed(1)}%)`}</p>
        </div>
      );
    }
    return null;
  };

  const SummaryIcon = positivePercentage >= 50 ? TrendingUp : TrendingDown;
  const summaryText = positivePercentage >= 50 ? 'The majority of feedback is positive.' : 'The majority of feedback is negative.';

  return (
    <Card className="shadow-lg bg-secondary/20 border-border/50 h-full">
        <CardHeader>
            <div className="flex items-center gap-3">
                <MessageCircle className="h-6 w-6 text-primary" />
                <div>
                    <CardTitle className="text-xl">Sentiment Analysis</CardTitle>
                    <CardDescription>A bird's-eye view of your guest feedback.</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="h-64 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={sentimentDistribution}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius="55%"
                            outerRadius="90%"
                            fill="#8884d8"
                            paddingAngle={5}
                        >
                            {sentimentDistribution.map((entry) => (
                              <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name as keyof typeof COLORS]} className="focus:outline-none" />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-4xl font-bold">
                            {totalReviews}
                        </span>
                        <span className="text-sm text-muted-foreground">Total Reviews</span>
                    </div>
                </div>
                <div>
                    <div className="text-center border-b border-border/50 pb-4 mb-4">
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <SummaryIcon className={cn("h-4 w-4", positivePercentage >= 50 ? 'text-accent' : 'text-destructive')} />
                            <span>{summaryText}</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-background/40 text-center">
                            <div className="flex items-center justify-center gap-2">
                                <Smile className="h-6 w-6 text-green-500" />
                                <h4 className="font-semibold text-lg">Positive</h4>
                            </div>
                            <p className="text-3xl font-bold">{positiveReviews}</p>
                            <p className="text-sm text-muted-foreground">{positivePercentage.toFixed(1)}% of total</p>
                            <p className="text-xs text-muted-foreground mt-2">Top Area: <span className="font-medium text-foreground">{topPositiveTopic}</span></p>
                        </div>
                         <div className="p-4 rounded-lg bg-background/40 text-center">
                            <div className="flex items-center justify-center gap-2">
                                <Frown className="h-6 w-6 text-red-500" />
                                <h4 className="font-semibold text-lg">Negative</h4>
                            </div>
                            <p className="text-3xl font-bold">{negativeReviews}</p>
                            <p className="text-sm text-muted-foreground">{negativePercentage.toFixed(1)}% of total</p>
                            <p className="text-xs text-muted-foreground mt-2">Top Concern: <span className="font-medium text-foreground">{topNegativeTopic}</span></p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="border-t border-border/50 pt-6 mt-6">
                <div className="flex items-start gap-4">
                    <Lightbulb className="h-8 w-8 text-primary flex-shrink-0" />
                    <div>
                        <h4 className="font-semibold text-lg text-foreground mb-1">Insights at a Glance</h4>
                        <p className="text-muted-foreground leading-relaxed">
                            {summary}
                        </p>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
  );
}

    