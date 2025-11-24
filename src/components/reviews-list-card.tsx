
'use client';
import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Star, Frown, Annoyed, Smile, Laugh, Meh, ChevronLeft, ChevronRight, MoreHorizontal, MessageSquareReply, ListFilter, ArrowUpDown, X } from 'lucide-react';
import type { Review } from './review-dashboard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { RatingCategory, TopicCategory } from '@/ai/schemas';
import { usePagination, DOTS } from '@/hooks/use-pagination';
import { ReplyDialog } from './reply-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from './ui/input';

interface ReviewsListCardProps {
  reviews: Review[];
}

const REVIEWS_PER_PAGE = 5;
const ALL_TOPICS: TopicCategory[] = ['Reservation', 'Management Service', 'Food', 'Payment', 'Other'];
const ALL_SENTIMENTS: RatingCategory[] = ['BEST', 'GOOD', 'FARE', 'BAD', 'Other'];

type SortKey = 'rating' | 'topic';
type SortDirection = 'ascending' | 'descending';

const categoryConfig: Record<RatingCategory, { icon: React.ElementType, color: string, badgeClass: string }> = {
    'BEST': { icon: Laugh, color: 'text-green-400', badgeClass: 'border-green-500/50 text-green-400' },
    'GOOD': { icon: Smile, color: 'text-lime-400', badgeClass: 'border-lime-500/50 text-lime-400' },
    'FARE': { icon: Annoyed, color: 'text-orange-400', badgeClass: 'border-orange-500/50 text-orange-400' },
    'BAD': { icon: Frown, color: 'text-red-400', badgeClass: 'border-destructive/50 text-destructive' },
    'Other': { icon: Meh, color: 'text-gray-400', badgeClass: 'bg-secondary text-secondary-foreground' }
};

export function ReviewsListCard({ reviews }: ReviewsListCardProps) {
  const [sentimentFilter, setSentimentFilter] = useState<RatingCategory | 'all'>('all');
  const [topicFilter, setTopicFilter] = useState<TopicCategory | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const sortedAndFilteredReviews = useMemo(() => {
    let sortableItems = [...reviews];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableItems.filter(review => {
      const sentimentMatch = sentimentFilter === 'all' || review.sentiment === sentimentFilter;
      const topicMatch = topicFilter === 'all' || review.topic === topicFilter;
      const searchMatch = searchQuery === '' || review.text.toLowerCase().includes(searchQuery.toLowerCase());
      return sentimentMatch && topicMatch && searchMatch;
    });
  }, [reviews, sentimentFilter, topicFilter, sortConfig, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sentimentFilter, topicFilter, sortConfig, searchQuery]);

  const totalPages = Math.ceil(sortedAndFilteredReviews.length / REVIEWS_PER_PAGE);

  const paginationRange = usePagination({
    currentPage,
    totalCount: sortedAndFilteredReviews.length,
    pageSize: REVIEWS_PER_PAGE,
  });

  const paginatedReviews = useMemo(() => {
    const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
    const endIndex = startIndex + REVIEWS_PER_PAGE;
    return sortedAndFilteredReviews.slice(startIndex, endIndex);
  }, [sortedAndFilteredReviews, currentPage]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const handleReplyClick = (review: Review) => {
    setSelectedReview(review);
    setIsReplyDialogOpen(true);
  };

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
        return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />;
    }
    if (sortConfig.direction === 'ascending') {
        return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return <ArrowUpDown className="ml-2 h-4 w-4" />;
  };

  return (
    <>
      <Card className="shadow-lg bg-secondary/20 border-border/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Detailed Reviews</CardTitle>
              <CardDescription>Browse through individual customer reviews.</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Input 
                    placeholder="Search reviews..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={cn(
                        "w-full pr-8",
                        searchQuery && "ring-2 ring-primary/50"
                    )}
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Clear search</span>
                    </Button>
                  )}
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={sentimentFilter !== 'all' ? 'default' : 'outline'} className="w-full sm:w-auto justify-start sm:justify-center">
                            <ListFilter className="mr-2 h-4 w-4" />
                            <span>
                                {sentimentFilter === 'all' ? 'Filter by Sentiment' : sentimentFilter}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuRadioGroup value={sentimentFilter} onValueChange={(value) => setSentimentFilter(value as any)}>
                            <DropdownMenuRadioItem value="all">All ({categoryCounts.all})</DropdownMenuRadioItem>
                            <DropdownMenuSeparator />
                            {ALL_SENTIMENTS.map(sentiment => (
                                <DropdownMenuRadioItem key={sentiment} value={sentiment}>{sentiment} ({categoryCounts[sentiment]})</DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={topicFilter !== 'all' ? 'default' : 'outline'} className="w-full sm:w-auto justify-start sm:justify-center">
                            <ListFilter className="mr-2 h-4 w-4" />
                            <span>
                                {topicFilter === 'all' ? 'Filter by Topic' : topicFilter}
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                        <DropdownMenuRadioGroup value={topicFilter} onValueChange={(value) => setTopicFilter(value as any)}>
                            <DropdownMenuRadioItem value="all">All Topics</DropdownMenuRadioItem>
                            <DropdownMenuSeparator />
                            {ALL_TOPICS.map(topic => (
                                <DropdownMenuRadioItem key={topic} value={topic}>{topic}</DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="min-h-[330px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground/80">Review</TableHead>
                  <TableHead className="w-[150px] text-center text-foreground/80">
                    <Button variant="ghost" onClick={() => requestSort('rating')} className="w-full justify-center">
                        Rating {getSortIcon('rating')}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[150px] text-center text-foreground/80">Sentiment</TableHead>
                  <TableHead className="w-[200px] text-center text-foreground/80">
                    <Button variant="ghost" onClick={() => requestSort('topic')} className="w-full justify-center">
                        Topic {getSortIcon('topic')}
                    </Button>
                  </TableHead>
                  <TableHead className="w-[100px] text-right text-foreground/80">Actions</TableHead>
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
                        <TableCell className="text-center">
                          {review.topic && (
                            <Badge variant="outline" className="capitalize">{review.topic}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleReplyClick(review)}>
                            <MessageSquareReply className="h-5 w-5 text-muted-foreground" />
                            <span className="sr-only">Reply</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
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
      {selectedReview && (
        <ReplyDialog
          isOpen={isReplyDialogOpen}
          onOpenChange={setIsReplyDialogOpen}
          review={selectedReview}
        />
      )}
    </>
  );
}

    