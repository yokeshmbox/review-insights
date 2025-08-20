
'use client';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Frown, Annoyed, Smile, Laugh, Meh, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import type { Review } from './review-dashboard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { RatingCategory } from '@/ai/schemas';
import { usePagination, DOTS } from '@/hooks/use-pagination';

interface ReviewsListCardProps {
  reviews: Review[];
}

const REVIEWS_PER_PAGE = 5;

const categoryConfig: Record<RatingCategory, { icon: React.ElementType, color: string, badgeClass: string }> = {
    'BEST': { icon: Laugh, color: 'text-green-400', badgeClass: 'border-green-500/50 text-green-400' },
    'GOOD': { icon: Smile, color: 'text-lime-400', badgeClass: 'border-lime-500/50 text-lime-400' },
    'FARE': { icon: Annoyed, color: 'text-orange-400', badgeClass: 'border-orange-500/50 text-orange-400' },
    'BAD': { icon: Frown, color: 'text-red-400', badgeClass: 'border-destructive/50 text-destructive' },
    'Other': { icon: Meh, color: 'text-gray-400', badgeClass: 'bg-secondary text-secondary-foreground' }
};

export function ReviewsListCard({ reviews }: ReviewsListCardProps) {
  const [filter, setFilter] = useState<RatingCategory | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const categoryCounts = useMemo(() => {
    const counts: Record<RatingCategory | 'all', number> = {
      all: reviews.length,
      BEST: 0,
      GOOD: 0,
      FARE: 0,
      BAD: 0,
      Other: 0,
    };
    reviews.forEach(review => {
      if (review.sentiment && counts.hasOwnProperty(review.sentiment)) {
        (counts[review.sentiment] as number)++;
      }
    });
    return counts;
  }, [reviews]);


  const filteredReviews = useMemo(() => {
    if (filter === 'all') {
      return reviews;
    }
    return reviews.filter(review => review.sentiment === filter);
  }, [reviews, filter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);

  const paginationRange = usePagination({
    currentPage,
    totalCount: filteredReviews.length,
    pageSize: REVIEWS_PER_PAGE,
  });

  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
    const endIndex = startIndex + REVIEWS_PER_PAGE;
    return filteredReviews.slice(startIndex, endIndex);
  }, [filteredReviews, currentPage]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };


  return (
    <Card className="shadow-lg bg-secondary/20 border-border/50">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Detailed Reviews</CardTitle>
            <CardDescription>Browse through individual customer reviews.</CardDescription>
          </div>
           <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 h-auto sm:h-10">
              <TabsTrigger value="all">All ({categoryCounts.all})</TabsTrigger>
              <TabsTrigger value="BEST">Best ({categoryCounts.BEST})</TabsTrigger>
              <TabsTrigger value="GOOD">Good ({categoryCounts.GOOD})</TabsTrigger>
              <TabsTrigger value="FARE">Fare ({categoryCounts.FARE})</TabsTrigger>
              <TabsTrigger value="BAD">Bad ({categoryCounts.BAD})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="min-h-[330px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-foreground/80">Review</TableHead>
                <TableHead className="w-[120px] text-center text-foreground/80">Rating</TableHead>
                <TableHead className="w-[150px] text-center text-foreground/80">Sentiment</TableHead>
                <TableHead className="w-[200px] text-right text-foreground/80">Topic</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedReviews.length > 0 ? (
                paginatedReviews.map((review) => {
                  const config = review.sentiment ? categoryConfig[review.sentiment] : null;
                  const Icon = config?.icon || Star;
                  
                  return (
                    <TableRow key={review.id} className="border-border/50">
                      <TableCell className="text-muted-foreground">{review.text}</TableCell>
                      <TableCell className="text-center font-medium text-foreground">
                        {review.rating !== null ? (
                          <div className="flex items-center justify-center gap-1.5">
                              <Star className={cn("h-4 w-4", review.rating >= 3 ? 'text-yellow-400' : 'text-muted-foreground/50')} fill="currentColor" />
                              <span>{review.rating.toFixed(1)}</span>
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-center">
                        {review.sentiment && config && (
                          <Badge
                            variant='outline'
                            className={cn('capitalize w-24 justify-center', config.badgeClass)}
                          >
                            <Icon className={cn("mr-1.5 h-3.5 w-3.5", config.color)} />
                            {review.sentiment}
                          </Badge>
                        )}
                      </TableCell>
                       <TableCell className="text-right">
                        {review.topic && (
                           <Badge variant="outline" className="capitalize">{review.topic}</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    No reviews match the current filter.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Previous</span>
                    </Button>
                    <div className="hidden sm:flex items-center gap-1">
                        {paginationRange?.map((page, index) => {
                          if (page === DOTS) {
                            return (
                              <div key={index} className="flex items-center justify-center h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </div>
                            );
                          }

                          return (
                            <Button
                              key={index}
                              variant={currentPage === page ? 'default' : 'outline'}
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handlePageClick(page as number)}
                            >
                              {page}
                            </Button>
                          );
                        })}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                    >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
