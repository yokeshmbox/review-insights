
'use client';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Loader2, HelpCircle, Sparkles, Send } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { answerQuestion } from '@/ai/flows/answer-question-flow';
import type { Review } from './review-dashboard';
import { Input } from './ui/input';

const TOP_QUESTIONS = [
    'What are the most common complaints about room cleanliness and maintenance?',
    'Summarize all feedback related to staff friendliness and professionalism.',
    'What are the top reasons guests give for a 5-star "BEST" rating?',
    'Are there any recurring issues with the check-in or check-out process?',
    'What specific food items are mentioned most often, and is the sentiment positive or negative?',
];

interface QAndACardProps {
    reviews: Review[];
}

export function QAndACard({ reviews }: QAndACardProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loadingQuestion, setLoadingQuestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [customQuestion, setCustomQuestion] = useState('');
  const [customAnswer, setCustomAnswer] = useState('');
  const [isCustomLoading, setIsCustomLoading] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);


  const handleQuestionClick = async (question: string) => {
    if (answers[question] || loadingQuestion === question) {
      return;
    }
    
    setLoadingQuestion(question);
    setError(null);
    try {
      const reviewTexts = reviews.map(r => r.text);
      const result = await answerQuestion({ reviews: reviewTexts, question });
      setAnswers(prev => ({ ...prev, [question]: result.answer }));
    } catch (e: any) {
      console.error("Failed to answer question:", e);
      toast({
        variant: 'destructive',
        title: 'Error Generating Answer',
        description: e.message || 'There was an issue getting the answer. Please try again.',
      });
      setError('Could not generate an answer. Please try again.');
    } finally {
      setLoadingQuestion(null);
    }
  };

  const handleCustomQuestionSubmit = async () => {
    if (!customQuestion.trim()) return;

    setIsCustomLoading(true);
    setCustomError(null);
    setCustomAnswer('');

    try {
      const reviewTexts = reviews.map(r => r.text);
      const result = await answerQuestion({ reviews: reviewTexts, question: customQuestion });
      setCustomAnswer(result.answer);
    } catch (e: any) {
        console.error("Failed to answer custom question:", e);
        toast({
            variant: 'destructive',
            title: 'Error Generating Answer',
            description: e.message || 'There was an issue getting the answer for your custom question. Please try again.',
        });
        setCustomError('Could not generate an answer for your question. Please try again.');
    } finally {
        setIsCustomLoading(false);
    }
  };

  return (
    <Card className="shadow-lg bg-secondary/20 border-border/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <HelpCircle className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-xl">Review Q&A</CardTitle>
            <CardDescription>Get instant answers to key questions about your feedback.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
            {/* Custom Question Section */}
            <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Ask a Custom Question</h3>
                <div className="flex items-center gap-2">
                    <Input
                        type="text"
                        placeholder="Type your question here..."
                        value={customQuestion}
                        onChange={(e) => setCustomQuestion(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCustomQuestionSubmit()}
                        disabled={isCustomLoading}
                    />
                    <Button onClick={handleCustomQuestionSubmit} disabled={isCustomLoading || !customQuestion.trim()}>
                        {isCustomLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        <span className="sr-only">Ask</span>
                    </Button>
                </div>
                {isCustomLoading && (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-primary"/>
                        <span>Generating answer...</span>
                    </div>
                )}
                {customAnswer && !isCustomLoading && (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed p-4 bg-background/50 rounded-md border border-border/50" dangerouslySetInnerHTML={{ __html: customAnswer.replace(/\n/g, '<br />') }} />
                )}
                {customError && !isCustomLoading && (
                    <Alert variant="destructive">
                        <AlertDescription>{customError}</AlertDescription>
                    </Alert>
                )}
            </div>

            <div className="border-t border-border/50 pt-6">
              <h3 className="font-semibold text-foreground mb-4">Or, get answers to common questions:</h3>
              <Accordion type="single" collapsible className="w-full space-y-2">
                  {TOP_QUESTIONS.map((question, index) => (
                      <AccordionItem value={`item-${index}`} key={index} className="bg-background/40 border-border/50 rounded-lg px-4 border">
                          <AccordionTrigger 
                              className="text-base hover:no-underline text-left"
                              onClick={() => handleQuestionClick(question)}
                          >
                              <div className="flex items-center gap-3 w-full pr-4">
                                  <Sparkles className="h-5 w-5 text-primary flex-shrink-0"/>
                                  <span className="font-semibold flex-1">{question}</span>
                              </div>
                          </AccordionTrigger>
                          <AccordionContent className="pt-2 pb-4 space-y-4">
                              {loadingQuestion === question && (
                                <div className="flex items-center justify-center gap-2 text-muted-foreground py-8">
                                      <Loader2 className="h-6 w-6 animate-spin text-primary"/>
                                      <span>Generating answer...</span>
                                </div>
                              )}
                              {answers[question] && (
                                  <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: answers[question].replace(/\n/g, '<br />') }} />
                              )}
                              {error && loadingQuestion !== question && (
                                  <Alert variant="destructive">
                                      <AlertDescription>{error}</AlertDescription>
                                  </Alert>
                              )}
                          </AccordionContent>
                      </AccordionItem>
                  ))}
              </Accordion>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
