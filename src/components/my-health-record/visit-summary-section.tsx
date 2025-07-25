
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';
import { Calendar as CalendarIcon, PlusCircle, FileText } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { VisitSummary } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

interface VisitSummarySectionProps {
  visitSummaries: VisitSummary[];
  onAddVisitSummary: (newEntryData: Omit<VisitSummary, 'id' | 'createdAt'>) => Promise<string | null>;
}

const VisitSummarySection: React.FC<VisitSummarySectionProps> = ({ visitSummaries, onAddVisitSummary }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newClinicName, setNewClinicName] = useState('');
  const [newDoctorName, setNewDoctorName] = useState('');
  const [newReasonForVisit, setNewReasonForVisit] = useState('');
  const [newVisitDate, setNewVisitDate] = useState<Date | undefined>(new Date());
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [newTreatmentPlan, setNewTreatmentPlan] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const { toast } = useToast();

  const handleAddVisitSummary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClinicName.trim() || !newReasonForVisit.trim() || !newVisitDate) {
      toast({ title: "Missing Information", description: "Clinic name, reason for visit, and visit date are required.", variant: "destructive" });
      return;
    }

    try {
      const newEntryId = await onAddVisitSummary({
        clinicName: newClinicName,
        doctorName: newDoctorName,
        reasonForVisit: newReasonForVisit,
        visitDate: Timestamp.fromDate(newVisitDate), // Convert Date to Timestamp
        diagnosis: newDiagnosis,
        treatmentPlan: newTreatmentPlan,
        notes: newNotes,
      });
      if (newEntryId) {
        toast({ title: "Visit Summary Added", description: "Your new visit summary has been saved." });
        setIsAddDialogOpen(false);
        resetAddVisitSummaryForm();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Could not add visit summary.";
      toast({ title: "Error Adding Visit Summary", description: errorMessage, variant: "destructive" });
    }
  };

  const resetAddVisitSummaryForm = () => {
    setNewClinicName('');
    setNewDoctorName('');
    setNewReasonForVisit('');
    setNewVisitDate(new Date());
    setNewDiagnosis('');
    setNewTreatmentPlan('');
    setNewNotes('');
  };

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <FileText className="h-6 w-6" /> Visit Summaries
        </h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <PlusCircle className="mr-2 h-5 w-5" /> Add Visit Summary
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Visit Summary</DialogTitle>
              <DialogDescription>
                Fill in the details from your visit. Fields marked * are required.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddVisitSummary} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="clinicName">Clinic Name *</Label>
                <Input id="clinicName" value={newClinicName} onChange={(e) => setNewClinicName(e.target.value)} placeholder="e.g., City General Hospital" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="doctorName">Doctor Name (Optional)</Label>
                <Input id="doctorName" value={newDoctorName} onChange={(e) => setNewDoctorName(e.target.value)} placeholder="e.g., Dr. Smith" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reasonForVisit">Reason For Visit *</Label>
                <Input id="reasonForVisit" value={newReasonForVisit} onChange={(e) => setNewReasonForVisit(e.target.value)} placeholder="e.g., Annual check-up" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="visitDate">Visit Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${!newVisitDate && "text-muted-foreground"}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newVisitDate ? format(newVisitDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newVisitDate}
                      onSelect={setNewVisitDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="diagnosis">Diagnosis (Optional)</Label>
                <Input id="diagnosis" value={newDiagnosis} onChange={(e) => setNewDiagnosis(e.target.value)} placeholder="e.g., Hypertension" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="treatmentPlan">Treatment Plan (Optional)</Label>
                <Textarea id="treatmentPlan" value={newTreatmentPlan} onChange={(e) => setNewTreatmentPlan(e.target.value)} placeholder="e.g., Medication, lifestyle changes" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea id="notes" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} placeholder="e.g., Follow-up in 3 months" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={!newClinicName.trim() || !newReasonForVisit.trim() || !newVisitDate}>
                  Save Summary
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {visitSummaries.length === 0 ? (
        <Card className="text-center py-8 shadow-md">
          <CardContent>
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg text-muted-foreground">No visit summaries added yet.</p>
            <p className="text-sm text-muted-foreground">Click "Add Visit Summary" to add a new entry.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {visitSummaries.map(summary => (
            <Card key={summary.id} className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg">{summary.clinicName}</CardTitle>
                <CardDescription>
                  {summary.doctorName ? `Dr. ${summary.doctorName}` : 'No doctor name provided'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Reason: {summary.reasonForVisit}</p>
                <p>Visit Date: {summary.visitDate instanceof Timestamp ? format(summary.visitDate.toDate(), "PPP") : "Invalid Date"}</p>
                {summary.diagnosis && <p>Diagnosis: {summary.diagnosis}</p>}
                {summary.treatmentPlan && <p>Treatment Plan: {summary.treatmentPlan}</p>}
                {summary.notes && <p>Notes: {summary.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

export default VisitSummarySection;
