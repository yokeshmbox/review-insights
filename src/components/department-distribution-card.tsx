
'use client';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import type { Review } from './review-dashboard';
import { Building2 } from 'lucide-react';

interface DepartmentDistributionCardProps {
  reviews: Review[];
}

export function DepartmentDistributionCard({ reviews }: DepartmentDistributionCardProps) {
  const reviewsByDept = useMemo(() => {
    const topicCategories = ['Reservation', 'Management Service', 'Food', 'Payment', 'Other'];
    const counts: { [key: string]: number } = {};

    topicCategories.forEach(topic => {
        counts[topic] = 0;
    });

    reviews.forEach(review => {
      if (review.topic) {
        if (counts[review.topic] !== undefined) {
          counts[review.topic]++;
        }
      }
    });

    return Object.entries(counts).map(([name, value]) => ({ name, count: value }));
  }, [reviews]);
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background/80 backdrop-blur-sm border rounded-md shadow-lg">
          <p className="label font-semibold">{label}</p>
          <p className="intro">{`Count: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-lg bg-secondary/20 border-border/50 h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-xl">Reviews by Department</CardTitle>
            <CardDescription>Total review volume per topic.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reviewsByDept} margin={{ top: 5, right: 20, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--primary) / 0.1)' }} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
