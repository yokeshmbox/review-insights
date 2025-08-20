
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sparkles, Utensils, BedDouble, HandCoins, Building, MessageSquareMore, Check } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { TopicCategory, GroupedTopicSuggestion } from '@/ai/schemas';

interface ImprovementSuggestionsCardProps {
  suggestions: GroupedTopicSuggestion[];
}

const topicConfig: Record<TopicCategory, { icon: LucideIcon, color: string }> = {
    'Reservation': { icon: BedDouble, color: 'text-blue-400' },
    'Management Service': { icon: Building, color: 'text-purple-400' },
    'Food': { icon: Utensils, color: 'text-orange-400' },
    'Payment': { icon: HandCoins, color: 'text-yellow-400' },
    'Other': { icon: MessageSquareMore, color: 'text-gray-400' }
};

export function ImprovementSuggestionsCard({ suggestions }: ImprovementSuggestionsCardProps) {
  return (
    <Card className="shadow-lg bg-secondary/20 border-border/50">
      <CardHeader>
        <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary" />
            <div>
                <CardTitle className="text-xl">Actionable Suggestions</CardTitle>
                <CardDescription>Key recommendations for each category.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {suggestions.length > 0 ? (
          <Accordion type="single" collapsible className="w-full space-y-2">
            {suggestions.map((item, index) => {
                const config = topicConfig[item.topic] || topicConfig['Other'];
                const Icon = config.icon;
                return (
                    <AccordionItem value={item.topic + '-' + index} key={item.topic + '-' + index} className="bg-background/40 border-border/50 rounded-lg px-4 border">
                        <AccordionTrigger className="text-base hover:no-underline">
                            <div className="flex items-center gap-3">
                                <Icon className={`h-5 w-5 ${config.color}`} />
                                <span className="font-semibold">{item.topic}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed pt-2 space-y-2">
                            {item.suggestions.map((suggestion, sIndex) => (
                                <div key={sIndex} className="flex items-start gap-2">
                                    <Check className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                                    <p>{suggestion}</p>
                                </div>
                            ))}
                        </AccordionContent>
                    </AccordionItem>
                );
            })}
          </Accordion>
        ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                <p>No specific suggestions generated.</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
