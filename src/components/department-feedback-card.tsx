
'use client';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarChart, PolarGrid, PolarAngleAxis, Legend, Tooltip, ResponsiveContainer, Radar } from 'recharts';
import type { Review } from './review-dashboard';
import { ShieldAlert } from 'lucide-react';
import type { RatingCategory } from '@/ai/schemas';

interface DepartmentFeedbackCardProps {
  reviews: Review[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background/80 backdrop-blur-sm border rounded-md shadow-lg text-sm">
          <p className="label font-bold mb-2">{label}</p>
          {payload.map((p: any, index: number) => (
            <div key={index} style={{ color: p.color }}>
                {p.name}: {p.value}
            </div>
          ))}
        </div>
      );
    }
    return null;
};

const sentimentCategories: RatingCategory[] = ['FARE', 'BAD'];

export function DepartmentFeedbackCard({ reviews }: DepartmentFeedbackCardProps) {
  const chartData = useMemo(() => {
    const topicCategories = ['Reservation', 'Management Service', 'Food', 'Payment', 'Other'];
    const counts: { [key: string]: { [key in RatingCategory]?: number } } = {};

    topicCategories.forEach(topic => {
        counts[topic] = { FARE: 0, BAD: 0 };
    });

    reviews.forEach(review => {
      if (review.topic && review.sentiment && sentimentCategories.includes(review.sentiment)) {
        if (counts[review.topic]) {
          counts[review.topic][review.sentiment] = (counts[review.topic][review.sentiment] || 0) + 1;
        }
      }
    });

    return Object.entries(counts).map(([topic, values]) => ({ 
        topic,
        FARE: values.FARE,
        BAD: values.BAD
    }));
  }, [reviews]);
  
  const hasData = useMemo(() => chartData.some(d => d.FARE! > 0 || d.BAD! > 0), [chartData]);

  return (
    <Card className="shadow-lg bg-secondary/20 border-border/50">
      <CardHeader>
        <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-primary" />
            <div>
                <CardTitle className="text-xl">Negative Feedback Analysis</CardTitle>
                <CardDescription>Identifying key areas for improvement.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                <PolarGrid stroke="hsl(var(--border) / 0.5)" />
                <PolarAngleAxis dataKey="topic" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span className="text-muted-foreground">{value}</span>}/>
                <Radar name="FARE" dataKey="FARE" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.6} />
                <Radar name="BAD" dataKey="BAD" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 w-full flex items-center justify-center">
            <p className="text-muted-foreground">No negative feedback found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
