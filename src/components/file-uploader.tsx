
'use client';

import { useCallback, useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { UploadCloud, FileCheck2, ShieldCheck, BarChart2, TestTube2 } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  onTest: () => void;
}

export function FileUploader({ onFileUpload, onTest }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((selectedFile: File | null) => {
    if (selectedFile) {
        if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || selectedFile.type === 'application/vnd.ms-excel' || selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls') || selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
            onFileUpload(selectedFile);
        } else {
            toast({
                variant: 'destructive',
                title: 'Invalid File Type',
                description: 'Please upload a valid Excel or CSV file (.xlsx, .xls, .csv).',
            });
        }
    }
  }, [onFileUpload, toast]);

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
      handleFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };
  
  const onButtonClick = () => {
    inputRef.current?.click();
  };

  return (
    <Card 
        className={cn(
            "w-full max-w-4xl mx-auto shadow-xl bg-background/30 border-2 border-dashed border-border/30 transition-all duration-300",
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
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".xlsx, .xls, .csv"
            onChange={(e) => handleFileSelect(e.target.files ? e.target.files[0] : null)}
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
            Upload Your Reviews File
          </h3>
          <p className="mt-2 text-base text-muted-foreground max-w-md">
            Drag and drop your Excel or CSV file here, or click below to select a file from your computer.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button size="lg" onClick={onButtonClick}>
              Browse Files
            </Button>
            <Button size="lg" variant="outline" onClick={onTest}>
                <TestTube2 className="mr-2" />
                Test with Mock Data
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground/80">
            Supports .xlsx, .xls, .csv
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
