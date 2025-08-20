
'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { FileUploader } from '@/components/file-uploader';
import { SentimentSummaryCard } from '@/components/sentiment-summary-card';
import { ReviewsListCard } from '@/components/reviews-list-card';
import { Loader2, BrainCircuit, Sparkles, FileCheck2, BarChartBig, Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { KeyPositivesCard } from './key-positives-card';
import { SentimentDistributionCard } from './sentiment-distribution-card';
import { DepartmentFeedbackCard } from './department-feedback-card';
import { DepartmentDistributionCard } from './department-distribution-card';
import { ImprovementSuggestionsCard } from './improvement-suggestions-card';
import { SentimentTrendCard, type SentimentTrendData } from './sentiment-trend-card';
import { DetailedFeedbackCard } from './detailed-feedback-card';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { parse } from 'date-fns';
import { analyzeReviews } from '@/ai/flows/analyze-reviews-flow';
import { generateSummary } from '@/ai/flows/generate-summary-flow';
import { generateSuggestions } from '@/ai/flows/generate-suggestions-flow';
import { generateTopicAnalysis } from '@/ai/flows/generate-topic-analysis-flow';

import type { AnalyzedReview, GroupedTopicSuggestion, TopicCategory, RatingCategory, TopicAnalysis } from '@/ai/schemas';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { ThemeToggle } from './theme-toggle';

export interface Review extends Omit<AnalyzedReview, 'rating' | 'topic'> {
  rating: number;
  month?: string;
  topic: TopicCategory;
}

export interface ConsolidatedReviewData {
  analyzedReviews: Review[];
  overallRating: number;
  consolidatedReview: string;
  keyPositives: string;
  suggestions: GroupedTopicSuggestion[];
}

export interface DetailedTopicAnalysis {
    topic: TopicCategory;
    total: number;
    positive: number;
    negative: number;
    analysis: TopicAnalysis;
}

const ALL_TOPICS: TopicCategory[] = ['Reservation', 'Management Service', 'Food', 'Payment', 'Other'];

const RATING_MAP: Record<RatingCategory, number> = {
  'BEST': 5,
  'GOOD': 4,
  'FARE': 2.5,
  'BAD': 1,
  'Other': 3
};

export function ReviewDashboard() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [consolidatedReviewData, setConsolidatedReviewData] = useState<ConsolidatedReviewData | null>(null);
  const [sentimentTrend, setSentimentTrend] = useState<SentimentTrendData[]>([]);
  const [detailedAnalysis, setDetailedAnalysis] = useState<DetailedTopicAnalysis[]>([]);
  const { toast } = useToast();
  const [loadingMessage, setLoadingMessage] = useState("Let's turn your data into delight ✨");
  const [loadingSubMessage, setLoadingSubMessage] = useState("Just a moment, we're firing up the AI to analyze your reviews!");

  const processReviews = async (items: {id: number, text: string, month: string}[]) => {
      
      const reviewTexts = items.map(item => item.text);
      
      try {
        setLoadingMessage("Connecting with your customers...");
        setLoadingSubMessage("Our AI is carefully reading every review to understand the real story.");
        const analyzedReviewsPromise = analyzeReviews({ reviews: reviewTexts });

        setLoadingMessage('Finding the story in the data...');
        setLoadingSubMessage('Weaving together feedback to see the big picture for you.');
        const summaryPromise = generateSummary({ reviews: reviewTexts });
        
        setLoadingMessage('Crafting your path to five stars...');
        setLoadingSubMessage("We're turning insights into your next steps for success.");
        const suggestionsPromise = generateSuggestions({ reviews: reviewTexts });

        const [analyzedReviewsResult, summaryResult, suggestionsResult] = await Promise.all([
          analyzedReviewsPromise,
          summaryPromise,
          suggestionsPromise,
        ]);

        if (!analyzedReviewsResult || !summaryResult || !suggestionsResult) {
            throw new Error("The AI model failed to return a valid analysis for the reviews.");
        }
        
        const allAnalyzedReviews = (analyzedReviewsResult.analyzedReviews || []).map((ar, index) => {
          const originalItem = items.find(item => item.id === ar.id);
          return {
              ...ar,
              topic: ar.topic || 'Other',
              rating: RATING_MAP[ar.sentiment] || 3,
              id: ar.id,
              month: originalItem?.month || ''
          } as Review;
        });
        
        const reviewsByTopic = new Map<TopicCategory, string[]>();
        allAnalyzedReviews.forEach(review => {
            const topic = review.topic || 'Other';
            if(review.text) {
                if (!reviewsByTopic.has(topic)) {
                    reviewsByTopic.set(topic, []);
                }
                reviewsByTopic.get(topic)!.push(review.text);
            }
        });

        const topicAnalysisPayloads = ALL_TOPICS.map(topic => ({
            topic,
            reviews: reviewsByTopic.get(topic) || []
        }));

        setLoadingMessage('Almost there, just polishing the gems...');
        setLoadingSubMessage("Your insights are being prepared. This is where the magic happens!");

        const topicAnalysisResults = await Promise.all(
            topicAnalysisPayloads.map(payload => 
                payload.reviews.length > 0 
                    ? generateTopicAnalysis({ reviews: payload.reviews })
                    : Promise.resolve({ detailedTopicAnalysis: [{
                        topic: payload.topic,
                        positiveSummary: 'No feedback provided for this topic.',
                        negativeSummary: 'No feedback provided for this topic.',
                        suggestions: [],
                    }]})
            )
        );

        if (!topicAnalysisResults) {
            throw new Error("The AI model failed to return a valid analysis for the reviews.");
        }
        
        setLoadingMessage('Your new dashboard is ready!');
        setLoadingSubMessage('Thanks for your patience. Here are the insights you were waiting for!');

        const detailedTopicAnalyses = ALL_TOPICS.map((topic, index) => {
            const topicReviews = allAnalyzedReviews.filter(r => r.topic === topic);
            const totalMentions = topicReviews.length;
            const analysisResult = topicAnalysisResults[index];
            
            const analysis = analysisResult && analysisResult.detailedTopicAnalysis.length > 0 
                ? analysisResult.detailedTopicAnalysis[0] 
                : undefined;

            const detailedAnalysisItem: DetailedTopicAnalysis = {
                topic: topic,
                total: totalMentions,
                positive: topicReviews.filter(r => r.sentiment === 'BEST' || r.sentiment === 'GOOD').length,
                negative: topicReviews.filter(r => r.sentiment === 'FARE' || r.sentiment === 'BAD').length,
                analysis: (totalMentions > 0 && analysis) ? { ...analysis, topic } : {
                    topic: topic,
                    positiveSummary: 'No feedback provided for this topic.',
                    negativeSummary: 'No feedback provided for this topic.',
                    suggestions: [],
                },
            };
            return detailedAnalysisItem;
        }).filter((item): item is DetailedTopicAnalysis => !!item && !!item.topic);
        
        setDetailedAnalysis(detailedTopicAnalyses);

        const overallRating = calculateOverallRating(allAnalyzedReviews);
        
        setReviews(allAnalyzedReviews);
        setConsolidatedReviewData({
          consolidatedReview: summaryResult.consolidatedReview || "No summary available.",
          keyPositives: summaryResult.keyPositives || "No positives identified.",
          suggestions: suggestionsResult.suggestions || [],
          analyzedReviews: allAnalyzedReviews,
          overallRating: overallRating
        });
        setSentimentTrend(calculateSentimentTrend(allAnalyzedReviews));
      } catch (e: any) {
        console.error(e);
        toast({
          variant: "destructive",
          title: "An error occurred",
          description: e.message || "Failed to analyze the reviews.",
        });
        resetState();
      }
  };

  const calculateOverallRating = (reviews: Review[]): number => {
      if (reviews.length === 0) return 0;
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      return totalRating / reviews.length;
  };

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    resetState(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, {type: 'array'});
      const worksheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[worksheetName];
      const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const parsedData = json
        .slice(1) // Ignore the first row (headings)
        .map((row, index) => ({
            id: index,
            text: String(row[0] || ''),
            month: String(row[1] || ''),
        }))
        .filter(item => item.text.trim() !== '' && item.month.trim() !== '');

      if (parsedData.length === 0) {
        toast({
          variant: "destructive",
          title: "Invalid File",
          description: "No valid reviews found. Ensure the first column has review text and the second has the month.",
        });
        resetState();
        return;
      }
      
      await processReviews(parsedData);

    } catch (e: any) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: e.message || "Failed to read or process the file. Please ensure it is a valid .xlsx or .csv file.",
      });
      resetState();
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTestData = async () => {
    setIsLoading(true);
    resetState(true);

    const mockReviews: Review[] = [
      { id: 0, text: "The room was sparkling clean and the bed was incredibly comfortable. I slept like a baby!", sentiment: 'BEST', topic: 'Other', rating: 5, month: 'Jan' },
      { id: 1, text: "Check-in was a bit slow, but the staff was friendly. The breakfast buffet had a great selection.", sentiment: 'GOOD', topic: 'Management Service', rating: 4, month: 'Feb' },
      { id: 2, text: "Our reservation was mixed up and we had to wait for an hour to get our room. Very frustrating start to our vacation.", sentiment: 'BAD', topic: 'Reservation', rating: 1, month: 'Mar' },
      { id: 3, text: "Absolutely loved the food at the restaurant! The pasta was divine. Service was a little slow, but the food made up for it.", sentiment: 'BEST', topic: 'Food', rating: 5, month: 'Apr' },
      { id: 4, text: "The Wi-Fi was terrible. I could barely get a signal in my room, which was a huge problem for my work meetings.", sentiment: 'BAD', topic: 'Other', rating: 1, month: 'May' },
      { id: 5, text: "I was overcharged for the minibar. It took two phone calls to get it sorted out. A hassle I didn't need.", sentiment: 'BAD', topic: 'Payment', rating: 1, month: 'Jun' },
      { id: 6, text: "The location is perfect, right in the heart of the city. The room was a bit small, but it was clean and had a great view.", sentiment: 'GOOD', topic: 'Other', rating: 4, month: 'Jul' },
      { id: 7, text: "Management was very unresponsive to my complaint about the noisy neighbors. I barely got any sleep.", sentiment: 'BAD', topic: 'Management Service', rating: 1, month: 'Aug' },
      { id: 8, text: "A truly 5-star experience! From the moment we arrived, the service was impeccable. The concierge gave us fantastic recommendations.", sentiment: 'BEST', topic: 'Management Service', rating: 5, month: 'Sep' },
      { id: 9, text: "The payment process was seamless. I paid with my card and got the receipt emailed to me instantly. Very efficient.", sentiment: 'BEST', topic: 'Payment', rating: 5, month: 'Oct' },
      { id: 10, text: "The food was cold and tasteless. A real disappointment for such an expensive hotel.", sentiment: 'BAD', topic: 'Food', rating: 1, month: 'Nov' },
      { id: 11, text: "Our booking was for a sea-view room, but we were given a room facing a brick wall. The front desk was not helpful.", sentiment: 'FARE', topic: 'Reservation', rating: 2.5, month: 'Dec' },
      { id: 12, text: "The staff at the front desk were incredibly rude and unhelpful. They acted like I was bothering them.", sentiment: 'BAD', topic: 'Management Service', rating: 1, month: 'Jan' },
      { id: 13, text: "I had an issue with my booking and the management team resolved it quickly and professionally. I was very impressed.", sentiment: 'BEST', topic: 'Management Service', rating: 5, month: 'Feb' },
      { id: 14, text: "The checkout process was a nightmare. They tried to charge me for things I never used. Be sure to check your bill carefully.", sentiment: 'BAD', topic: 'Payment', rating: 1, month: 'Mar' },
    ];
    
    setReviews(mockReviews);

    const overallRating = calculateOverallRating(mockReviews);
    
    setConsolidatedReviewData({
      consolidatedReview: "Overall, feedback is mixed. While many guests praise the food and service, significant issues with reservations, billing, and Wi-Fi detract from the experience.",
      keyPositives: "- Delicious food, especially the pasta\n- Friendly and professional staff\n- Seamless payment process\n- Excellent location",
      suggestions: [
        { topic: 'Reservation', suggestions: ['Improve reservation system to avoid mix-ups.', 'Ensure early check-in confirmations are honored.'] },
        { topic: 'Payment', suggestions: ['Double-check bills for accuracy before presenting to guests.'] },
        { topic: 'Other', suggestions: ['Upgrade Wi-Fi infrastructure for better coverage and speed.'] },
        { topic: 'Management Service', suggestions: ['Improve responsiveness to guest complaints, particularly regarding noise.'] }
      ],
      analyzedReviews: mockReviews,
      overallRating: overallRating
    });
    
    const mockDetailedAnalysis: DetailedTopicAnalysis[] = ALL_TOPICS.map(topic => {
      const topicReviews = mockReviews.filter(r => r.topic === topic);
      return {
        topic: topic,
        total: topicReviews.length,
        positive: topicReviews.filter(r => r.sentiment === 'BEST' || r.sentiment === 'GOOD').length,
        negative: topicReviews.filter(r => r.sentiment === 'FARE' || r.sentiment === 'BAD').length,
        analysis: {
          topic: topic,
          positiveSummary: topicReviews.length > 0 ? `Positive feedback on ${topic}.` : 'No positive feedback provided.',
          negativeSummary: topicReviews.length > 0 ? `Negative feedback on ${topic}.` : 'No negative feedback provided.',
          suggestions: topicReviews.length > 0 ? [`Address ${topic} issues promptly.`] : [],
        },
      };
    });

    setDetailedAnalysis(mockDetailedAnalysis);
    setSentimentTrend(calculateSentimentTrend(mockReviews));
    
    // Using a timeout to simulate loading and give time for state to update
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };
  
  const calculateSentimentTrend = (reviews: Review[]): SentimentTrendData[] => {
      const monthlyData: { [key:string]: { totalRating: number; count: number } } = {};
  
      reviews.forEach(review => {
          if (review.month && review.rating) {
              const monthKey = review.month.slice(0, 3);
              if (!monthlyData[monthKey]) {
                  monthlyData[monthKey] = { totalRating: 0, count: 0 };
              }
              monthlyData[monthKey].totalRating += review.rating;
              monthlyData[monthKey].count++;
          }
      });
  
      const trend = Object.entries(monthlyData).map(([month, data]) => ({
          month: month,
          'Avg. Rating': (data.totalRating / data.count).toFixed(2),
      }));
  
      trend.sort((a, b) => {
        try {
            const dateA = parse(a.month, 'MMM', new Date());
            const dateB = parse(b.month, 'MMM', new Date());
            return dateA.getTime() - dateB.getTime();
        } catch {
            return a.month.localeCompare(b.month);
        }
      });
      
      return trend;
  };

  const resetState = (loading = false) => {
    setReviews([]);
    setConsolidatedReviewData(null);
    setSentimentTrend([]);
    setDetailedAnalysis([]);
    setIsLoading(loading);
    setLoadingMessage("Let's turn your data into delight ✨");
    setLoadingSubMessage("Just a moment, we're firing up the AI to analyze your reviews!");
  };

  const featureCards = [
    {
      icon: <FileCheck2 className="h-8 w-8 text-primary" />,
      title: "Upload Your Data",
      description: "Simply upload your customer reviews in an Excel or CSV file.",
    },
    {
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      title: "Instant Analysis",
      description: "Our system processes each review for sentiment and topic.",
    },
    {
      icon: <BarChartBig className="h-8 w-8 text-primary" />,
      title: "Visualize Insights",
      description: "Explore interactive charts and get actionable suggestions.",
    }
  ];
  
  return (
    <div className="container mx-auto max-w-7xl space-y-12 py-12 px-4">
      <header className="relative text-center">
        <div className="absolute top-0 right-0 flex flex-col items-end gap-2">
            <ThemeToggle />
            {!isLoading && reviews.length > 0 && (
                <Tooltip>
                    <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={() => resetState()}>
                        <Upload />
                        <span className="sr-only">New Analysis</span>
                    </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                    <p>New Analysis</p>
                    </TooltipContent>
                </Tooltip>
            )}
        </div>
        <div className="flex flex-col items-center">
            <div className="flex items-center gap-3">
                <BrainCircuit className="h-10 w-10 text-primary" />
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-foreground">
                    Hospitality Pulse AI
                </h1>
            </div>
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mt-2">
                Your Intelligent Partner in Guest Feedback.
            </p>
        </div>
      </header>

      {isLoading && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center bg-secondary/30">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-lg font-semibold text-foreground">{loadingMessage}</p>
            <p className="text-muted-foreground mt-1">{loadingSubMessage}</p>
        </div>
      )}

      {!isLoading && reviews.length === 0 && (
        <div className="max-w-4xl mx-auto space-y-12">
             <div className="space-y-6 text-center">
                <h2 className="text-3xl font-bold tracking-tight">How It Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {featureCards.map((feature, index) => (
                        <Card key={index} className="bg-secondary/20 border-border/30 text-center p-6">
                            <div className="flex justify-center mb-4">{feature.icon}</div>
                            <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </Card>
                    ))}
                </div>
            </div>
            <FileUploader onFileUpload={handleFileUpload} onTest={handleTestData} />
        </div>
      )}
      
      {!isLoading && reviews.length > 0 && consolidatedReviewData && (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* 1. Analysis Summary */}
            <SentimentSummaryCard reviews={reviews} consolidatedRating={consolidatedReviewData.overallRating} />
            
            {/* 2. Sentiment Analysis & Insights at a Glance */}
            <SentimentDistributionCard reviews={reviews} summary={consolidatedReviewData.consolidatedReview} />

            {/* 3. Actionable Suggestions & Key Positives */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <KeyPositivesCard positives={consolidatedReviewData.keyPositives} />
                <ImprovementSuggestionsCard suggestions={consolidatedReviewData.suggestions} />
            </div>
            
            {/* 4. Others */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <DepartmentDistributionCard reviews={reviews} />
                <DepartmentFeedbackCard reviews={reviews} />
            </div>

            <SentimentTrendCard data={sentimentTrend} />

            {detailedAnalysis.length > 0 && <DetailedFeedbackCard analysis={detailedAnalysis} totalReviewCount={reviews.length} />}

            <ReviewsListCard reviews={reviews} />
        </div>
      )}
    </div>
  );
}

    
    
    
