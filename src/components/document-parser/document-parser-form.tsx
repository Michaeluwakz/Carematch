"use client";

import { useState, type ChangeEvent, type FormEvent } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { interpretDocument, type InterpretDocumentInput, type InterpretDocumentOutput } from '@/ai/flows/document-interpretation';
import { Loader2, Upload, FileText, Info, Lightbulb, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export function DocumentParserForm() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<InterpretDocumentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File is too large. Please upload a file smaller than 5MB.");
        setFile(null);
        setPreviewUrl(null);
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(selectedFile.type)) {
        setError("Invalid file type. Please upload an image (JPG, PNG, WEBP) or PDF.");
        setFile(null);
        setPreviewUrl(null);
        return;
      }
      setFile(selectedFile);
      setError(null);
      setResult(null); // Clear previous results

      // Create a preview URL for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreviewUrl(null); // No preview for PDF or other types
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const documentDataUri = await fileToDataUri(file);
      const input: InterpretDocumentInput = { documentDataUri };
      const interpretationResult = await interpretDocument(input);
      setResult(interpretationResult);
      toast({
        title: "Document Interpreted",
        description: "Successfully extracted information from your document.",
        variant: "default",
      });
    } catch (err) {
      console.error("Error interpreting document:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to interpret document: ${errorMessage}`);
      toast({
        title: "Interpretation Failed",
        description: `Could not interpret the document. ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Smart Document Interpreter
        </CardTitle>
        <CardDescription>
          Upload a health document (insurance card, prescription, etc.) and our AI will extract key information and explain it in simple terms.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="document-upload" className="block text-sm font-medium text-foreground mb-1">
              Upload Document
            </label>
            <Input 
              id="document-upload" 
              type="file" 
              onChange={handleFileChange} 
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
              aria-describedby="file-help"
            />
            <p id="file-help" className="mt-1 text-xs text-muted-foreground">
              Supported: JPG, PNG, WEBP, PDF. Max size: 5MB.
            </p>
          </div>

          {previewUrl && (
            <div className="mt-4 border rounded-md p-2 bg-muted/50">
              <p className="text-sm font-medium text-center mb-2">Image Preview:</p>
              <Image src={previewUrl} alt="Document preview" width={400} height={300} className="rounded-md object-contain max-h-60 w-auto mx-auto" />
            </div>
          )}
           {file && !previewUrl && file.type === 'application/pdf' && (
            <div className="mt-4 border rounded-md p-4 bg-muted/50 text-center">
              <FileText className="h-12 w-12 mx-auto text-primary" />
              <p className="text-sm font-medium mt-2">{file.name}</p>
              <p className="text-xs text-muted-foreground">PDF file selected (no preview available)</p>
            </div>
          )}


          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Button type="submit" disabled={isLoading || !file} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Interpret Document
          </Button>
        </form>
      </CardContent>
      {result && (
        <CardFooter className="flex flex-col items-start gap-4 pt-6 border-t">
          <h3 className="text-lg font-semibold text-primary">Interpretation Results:</h3>
          <Card className="w-full bg-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-md">
                <Info className="h-5 w-5 text-primary" />
                Extracted Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{result.extractedInformation}</p>
            </CardContent>
          </Card>
          <Card className="w-full bg-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-md">
                <Lightbulb className="h-5 w-5 text-accent" />
                Plain Language Explanation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{result.plainLanguageExplanation}</p>
            </CardContent>
          </Card>
        </CardFooter>
      )}
    </Card>
  );
}
