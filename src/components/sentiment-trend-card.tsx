
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

export interface SentimentTrendData {
    month: string;
    'Avg. Rating': string;
}

interface SentimentTrendCardProps {
  data: SentimentTrendData[];
}

export function SentimentTrendCard({ data }: SentimentTrendCardProps) {

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background/80 backdrop-blur-sm border rounded-md shadow-lg">
          <p className="label font-semibold">{label}</p>
          <p className="intro" style={{color: payload[0].stroke}}>{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };
    
  return (
    <Card className="shadow-lg bg-secondary/20 border-border/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-xl">Sentiment Trend</CardTitle>
            <CardDescription>Monthly average guest rating over time.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 0,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
                    <YAxis domain={[1, 5]} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false}/>
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }} />
                    <Line type="monotone" dataKey="Avg. Rating" stroke="hsl(var(--primary))" strokeWidth={2} activeDot={{ r: 8 }} dot={{r: 4, fill: 'hsl(var(--primary))'}} />
                </LineChart>
            </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
