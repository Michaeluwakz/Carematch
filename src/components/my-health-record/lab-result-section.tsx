
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';
import { Calendar as CalendarIcon, PlusCircle, Microscope } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { LabResult } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

interface LabResultSectionProps {
  labResults: LabResult[];
  onAddLabResult: (newEntryData: Omit<LabResult, 'id' | 'createdAt'>) => Promise<string | null>;
}

const LabResultSection: React.FC<LabResultSectionProps> = ({ labResults, onAddLabResult }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTestName, setNewTestName] = useState('');
  const [newResultDate, setNewResultDate] = useState<Date | undefined>(new Date());
  const [newValue, setNewValue] = useState('');
  const [newUnits, setNewUnits] = useState('');
  const [newReferenceRange, setNewReferenceRange] = useState('');
  const [newInterpretation, setNewInterpretation] = useState('');
  const [newLabName, setNewLabName] = useState('');
  const [newFilePath, setNewFilePath] = useState('');
  const { toast } = useToast();

  const handleAddLabResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTestName.trim() || !newResultDate) {
      toast({ title: "Missing Information", description: "Test name and result date are required.", variant: "destructive" });
      return;
    }

    try {
      const newEntryId = await onAddLabResult({
        testName: newTestName,
        resultDate: newResultDate as Date, // Ensure it's a Date object
        value: newValue,
        units: newUnits,
        referenceRange: newReferenceRange,
        interpretation: newInterpretation,
        labName: newLabName,
        filePath: newFilePath,
      });
      if (newEntryId) {
        toast({ title: "Lab Result Added", description: "Your new lab result has been saved." });
        setIsAddDialogOpen(false);
        resetAddLabResultForm();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Could not add lab result.";
      toast({ title: "Error Adding Lab Result", description: errorMessage, variant: "destructive" });
    }
  };

  const resetAddLabResultForm = () => {
    setNewTestName('');
    setNewResultDate(new Date());
    setNewValue('');
    setNewUnits('');
    setNewReferenceRange('');
    setNewInterpretation('');
    setNewLabName('');
    setNewFilePath('');
  };

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Microscope className="h-6 w-6" /> Lab Results
        </h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <PlusCircle className="mr-2 h-5 w-5" /> Add Lab Result
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Lab Result</DialogTitle>
              <DialogDescription>
                Fill in the details for your lab result. Fields marked * are required.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddLabResult} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="testName">Test Name *</Label>
                <Input id="testName" value={newTestName} onChange={(e) => setNewTestName(e.target.value)} placeholder="e.g., CBC" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="resultDate">Result Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${!newResultDate && "text-muted-foreground"}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newResultDate ? format(newResultDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newResultDate}
                      onSelect={setNewResultDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="value">Value (Optional)</Label>
                <Input id="value" value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="e.g., 4.5" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="units">Units (Optional)</Label>
                <Input id="units" value={newUnits} onChange={(e) => setNewUnits(e.target.value)} placeholder="e.g., x10^9/L" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="referenceRange">Reference Range (Optional)</Label>
                <Input id="referenceRange" value={newReferenceRange} onChange={(e) => setNewReferenceRange(e.target.value)} placeholder="e.g., 4.0-10.0 x10^9/L" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="interpretation">Interpretation (Optional)</Label>
                <Input id="interpretation" value={newInterpretation} onChange={(e) => setNewInterpretation(e.target.value)} placeholder="e.g., Normal" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="labName">Lab Name (Optional)</Label>
                <Input id="labName" value={newLabName} onChange={(e) => setNewLabName(e.target.value)} placeholder="e.g., Quest Diagnostics" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="filePath">File Path (Optional)</Label>
                <Input id="filePath" value={newFilePath} onChange={(e) => setNewFilePath(e.target.value)} placeholder="e.g., /path/to/file.pdf" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={!newTestName.trim() || !newResultDate}>
                  Save Result
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {labResults.length === 0 ? (
        <Card className="text-center py-8 shadow-md">
          <CardContent>
            <Microscope className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg text-muted-foreground">No lab results added yet.</p>
            <p className="text-sm text-muted-foreground">Click "Add Lab Result" to add a new entry.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {labResults.map(result => (
            <Card key={result.id} className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg">{result.testName}</CardTitle>
                <CardDescription>
                  Result Date: {result.resultDate instanceof Timestamp ? format(result.resultDate.toDate(), "PPP") : "Invalid Date"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result.value && <p>Value: {result.value} {result.units}</p>}
                {result.referenceRange && <p>Reference Range: {result.referenceRange}</p>}
                {result.interpretation && <p>Interpretation: {result.interpretation}</p>}
                {result.labName && <p>Lab Name: {result.labName}</p>}
                {result.filePath && <p>File Path: {result.filePath}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

export default LabResultSection;
