
'use client';

import { useCallback, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { UploadCloud, FileCheck2, TestTube2, FileJson, FileSpreadsheet, ClipboardList } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  onSurveyUpload: (file: File) => void;
  onTest: () => void;
}

export function FileUploader({ onFileUpload, onSurveyUpload, onTest }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const surveyInputRef = useRef<HTMLInputElement>(null);


  const handleFileSelect = useCallback((selectedFile: File | null, type: 'review' | 'json' | 'survey') => {
    if (selectedFile) {
        const isReviewFile = type === 'review' && (
            selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            selectedFile.type === 'application/vnd.ms-excel' ||
            selectedFile.name.endsWith('.xlsx') ||
            selectedFile.name.endsWith('.xls') ||
            selectedFile.name.endsWith('.csv')
        );
        const isAnalysisJsonFile = type === 'json' && (selectedFile.type === 'application/json' || selectedFile.name.endsWith('.json'));
        const isSurveyJsonFile = type === 'survey' && (selectedFile.type === 'application/json' || selectedFile.name.endsWith('.json'));

        if (isAnalysisJsonFile) {
            onFileUpload(selectedFile);
        } else if (isReviewFile) {
            onFileUpload(selectedFile);
        } else if (isSurveyJsonFile) {
            onSurveyUpload(selectedFile);
        } else {
            toast({
                variant: 'destructive',
                title: 'Invalid File Type',
                description: 'Please upload a file of the correct type for the selected option.',
            });
        }
    }
  }, [onFileUpload, onSurveyUpload, toast]);


  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      // Default to review file upload on drag-drop for simplicity
      handleFileSelect(e.dataTransfer.files[0], 'review');
      e.dataTransfer.clearData();
    }
  };
  
  const onUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  const onJsonButtonClick = () => {
    jsonInputRef.current?.click();
  };

  const onSurveyButtonClick = () => {
    surveyInputRef.current?.click();
  };

  return (
    <Card 
        className={cn(
            "w-full max-w-5xl mx-auto shadow-xl bg-background/30 border-2 border-dashed border-border/30 transition-all duration-300",
            isDragging && "border-primary/80 bg-primary/10 shadow-2xl scale-105"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
    >
      <CardContent className="p-8 sm:p-12">
        <div className="flex flex-col items-center justify-center w-full text-center">
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".xlsx, .xls, .csv"
                onChange={(e) => handleFileSelect(e.target.files ? e.target.files[0] : null, 'review')}
            />
            <input
                ref={jsonInputRef}
                type="file"
                className="hidden"
                accept=".json"
                onChange={(e) => handleFileSelect(e.target.files ? e.target.files[0] : null, 'json')}
            />
             <input
                ref={surveyInputRef}
                type="file"
                className="hidden"
                accept=".json"
                onChange={(e) => handleFileSelect(e.target.files ? e.target.files[0] : null, 'survey')}
            />

          <div className="relative mb-6">
            <div className={cn(
                "flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 border-8 border-primary/5 transition-all duration-300",
                isDragging && "scale-110"
            )}>
                <UploadCloud className={cn("h-12 w-12 text-primary transition-all duration-300", isDragging && "scale-125")} />
            </div>
          </div>
          <h3 className="mt-2 text-3xl font-bold text-foreground tracking-tight">
            Start Your Analysis
          </h3>
          <p className="mt-2 text-base text-muted-foreground max-w-md">
            Drag and drop your review file here, or choose an option below.
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
              {/* Option 1: New Analysis */}
              <div className="flex flex-col items-center p-6 bg-secondary/30 rounded-lg border border-border/50">
                  <FileSpreadsheet className="h-10 w-10 text-primary mb-3"/>
                  <h4 className="font-semibold text-lg">Review File</h4>
                  <p className="text-sm text-muted-foreground mt-1 mb-4 h-12">Analyze a new Excel or CSV review file.</p>
                  <Button size="lg" onClick={onUploadButtonClick} className="w-full">
                    Upload Reviews
                  </Button>
              </div>

              {/* Option 2: Survey Format */}
              <div className="flex flex-col items-center p-6 bg-secondary/30 rounded-lg border border-border/50">
                  <ClipboardList className="h-10 w-10 text-primary mb-3"/>
                  <h4 className="font-semibold text-lg">Survey File</h4>
                  <p className="text-sm text-muted-foreground mt-1 mb-4 h-12">Upload a survey-formatted JSON file.</p>
                  <Button size="lg" onClick={onSurveyButtonClick} className="w-full">
                    Upload Survey
                  </Button>
              </div>

              {/* Option 3: Load Analysis */}
              <div className="flex flex-col items-center p-6 bg-secondary/30 rounded-lg border border-border/50">
                  <FileJson className="h-10 w-10 text-primary mb-3"/>
                  <h4 className="font-semibold text-lg">Load Analysis</h4>
                  <p className="text-sm text-muted-foreground mt-1 mb-4 h-12">Load a previously exported `.json` analysis.</p>
                  <Button size="lg" variant="outline" onClick={onJsonButtonClick} className="w-full">
                    Load JSON
                  </Button>
              </div>
          </div>

          <div className="mt-8 text-center">
             <p className="text-muted-foreground mb-4">Or, see how it works with sample data:</p>
             <Button size="lg" variant="ghost" onClick={onTest}>
                <TestTube2 className="mr-2" />
                Test with Mock Data
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
