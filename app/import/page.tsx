"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from 'lucide-react';
import { cn } from "@/lib/utils";
import { sleep } from "@/lib/utils";

const BATCH_SIZE = 5;
const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setError(null);

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFile = e.dataTransfer.files[0];
    if (!droppedFile) return;

    if (!droppedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setFile(droppedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const reader = new FileReader();
      
      const csvData = await new Promise<string>((resolve, reject) => {
        reader.onload = (event) => {
          resolve(event.target?.result as string);
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      });

      // Parse CSV (skip header row and split into rows)
      const rows = csvData.split('\n').slice(1).filter(row => row.trim());
      const profiles = rows.map(row => {
        const [discord_username, help_required, helpful_skills] = row.split(',').map(field => field.trim());
        return {
          name: discord_username,
          bio: `Help Required: ${help_required}\nHelpful Skills: ${helpful_skills}`,
          matchingContext: help_required
        };
      });

      // Process profiles in batches
      let processedCount = 0;
      let failedCount = 0;

      for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
        const batch = profiles.slice(i, i + BATCH_SIZE);
        
        try {
          const response = await fetch('/api/matches/batch', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(batch),
          });

          if (!response.ok) {
            throw new Error(`Batch failed with status ${response.status}`);
          }

          const result = await response.json();
          processedCount += result.count;

          // Update progress
          setError(`Processing... ${processedCount}/${profiles.length} profiles completed`);

          // Wait before processing next batch
          if (i + BATCH_SIZE < profiles.length) {
            await sleep(DELAY_BETWEEN_BATCHES);
          }

        } catch (batchError) {
          console.error('Batch processing error:', batchError);
          failedCount += batch.length;
          setError(`Failed to process batch: ${batchError}. Continuing with next batch...`);
        }
      }

      if (failedCount > 0) {
        setError(`Import completed with errors. Successfully processed ${processedCount} profiles, ${failedCount} failed.`);
      } else {
        setError(null);
        alert(`Successfully processed all ${processedCount} profiles`);
        setFile(null);
      }

    } catch (err) {
      setError(`Failed to process CSV file. Please try again. Details: ${err}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      <div className="container mx-auto p-4 max-w-3xl pt-8">
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] shadow-xl">
          <CardHeader className="border-b border-[#2A2A2A]">
            <CardTitle className="text-2xl font-medium bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Import Members
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div 
                  className="flex flex-col items-center justify-center border-2 border-dashed border-[#2A2A2A] rounded-lg p-8 bg-[#232323]"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <Upload className="h-8 w-8 text-white/60" />
                    <div className="text-sm text-white/60">
                      {file ? (
                        <span className="text-white/90">{file.name}</span>
                      ) : (
                        <>
                          <span className="text-white/90">Click to upload</span> or drag and drop
                          <br />
                          CSV files only
                        </>
                      )}
                    </div>
                  </label>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-center p-3 rounded">
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={!file || isUploading}
                  className={cn(
                    "w-full transition-all duration-300",
                    !file
                      ? "bg-white/5 cursor-not-allowed opacity-50"
                      : "bg-white/10 hover:bg-white/15 opacity-100",
                    "text-white border border-white/10"
                  )}
                >
                  {isUploading ? "Uploading..." : "Upload CSV"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 