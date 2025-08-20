
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, Check, GitBranch } from 'lucide-react';
import type { DetailedTopicAnalysis } from './review-dashboard';

interface DetailedFeedbackCardProps {
  analysis: DetailedTopicAnalysis[];
  totalReviewCount: number;
}

export function DetailedFeedbackCard({ analysis, totalReviewCount }: DetailedFeedbackCardProps) {
  if (!analysis.length) return null;

  return (
    <Card className="shadow-lg bg-secondary/20 border-border/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <GitBranch className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-xl">Detailed Feedback Breakdown</CardTitle>
            <CardDescription>Detailed analysis of review categories, showing positive and negative sentiment.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-sm font-semibold text-muted-foreground">
          <div className="col-span-2">Category</div>
          <div className="col-span-2 text-center">Mentions</div>
          <div className="col-span-2 text-center">Positive / Negative</div>
          <div className="col-span-3">Summary</div>
          <div className="col-span-3">Suggestions</div>
        </div>

        {/* Table Body */}
        <div className="space-y-4">
          {analysis.map((item, index) => {
            const positivePercentage = item.total > 0 ? (item.positive / item.total) * 100 : 0;
            const negativePercentage = item.total > 0 ? (item.negative / item.total) * 100 : 0;

            return (
              <div key={item.topic} className="border-t border-border/50 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  {/* Category */}
                  <div className="md:col-span-2">
                    <h3 className="font-semibold text-base text-foreground">{item.topic}</h3>
                  </div>

                  {/* Mentions, Positive, Negative */}
                  <div className="md:col-span-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="font-bold text-lg">{item.total}</div>
                        <Badge variant="outline" className="text-xs">
                          {((item.total / totalReviewCount) * 100).toFixed(0)}% of total
                        </Badge>
                    </div>
                     <div>
                        <div className="font-bold text-lg">{item.positive}</div>
                        <Badge variant="outline" className="text-xs border-green-600/50 text-green-400">
                          {positivePercentage.toFixed(0)}%
                        </Badge>
                    </div>
                     <div>
                        <div className="font-bold text-lg">{item.negative}</div>
                        <Badge variant="outline" className="text-xs border-red-500/50 text-red-400">
                          {negativePercentage.toFixed(0)}%
                        </Badge>
                    </div>
                  </div>

                  {/* Summaries */}
                  <div className="md:col-span-3 space-y-3">
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <ThumbsUp className="h-5 w-5 mt-0.5 text-green-500 flex-shrink-0" />
                        <p>{item.analysis.positiveSummary}</p>
                    </div>
                     <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <ThumbsDown className="h-5 w-5 mt-0.5 text-red-500 flex-shrink-0" />
                        <p>{item.analysis.negativeSummary}</p>
                    </div>
                  </div>
                  
                  {/* Suggestions */}
                  <div className="md:col-span-3 space-y-2">
                    {item.analysis.suggestions && item.analysis.suggestions.length > 0 ? (
                      item.analysis.suggestions.map((suggestion, sIndex) => (
                        <div key={sIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                          <p>{suggestion}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No suggestions available.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
