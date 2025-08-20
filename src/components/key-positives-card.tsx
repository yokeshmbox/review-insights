
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThumbsUp, CheckCircle2, Award, Heart, Sparkles, Star } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KeyPositivesCardProps {
  positives: string;
}

const positiveIcons: {icon: LucideIcon, color: string}[] = [
    { icon: Award, color: 'text-yellow-400' },
    { icon: Heart, color: 'text-red-400' },
    { icon: Sparkles, color: 'text-blue-400' },
    { icon: Star, color: 'text-amber-400' },
    { icon: ThumbsUp, color: 'text-green-400' },
];

export function KeyPositivesCard({ positives }: KeyPositivesCardProps) {
  // Simple markdown-to-html for bullet points
  const formatText = (text: string) => {
    return text.split('\n').map(line => line.trim().replace(/^-/,'').trim()).filter(line => line);
  };

  const positivePoints = formatText(positives);

  return (
    <Card className="shadow-lg bg-secondary/20 border-border/50 h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
            <ThumbsUp className="h-6 w-6 text-primary" />
            <div>
                <CardTitle className="text-xl">Key Positives</CardTitle>
                <CardDescription>What guests loved the most.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {positivePoints.length > 0 ? (
            <div className="space-y-3">
                {positivePoints.map((point, index) => {
                    const { icon: Icon, color } = positiveIcons[index % positiveIcons.length];
                    return (
                        <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-background/40 border border-border/50 transition-all hover:border-accent/80 hover:bg-accent/10">
                            <div className="flex-shrink-0 mt-1">
                                <Icon className={cn("h-5 w-5", color)} />
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                {point}
                            </p>
                        </div>
                    );
                })}
            </div>
        ) : (
             <div className="h-full w-full flex items-center justify-center">
                <p className="text-muted-foreground">No specific positives were highlighted.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
