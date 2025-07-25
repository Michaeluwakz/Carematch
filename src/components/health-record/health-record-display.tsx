
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { UserProfile, VisitSummary, ImmunizationRecord, LabResult } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Loader2, AlertCircle, PlusCircle, FileText, Shield, Beaker, CalendarIcon, NotebookText, Pill, Microscope } from 'lucide-react';
import { format } from 'date-fns';
import { Timestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { addHealthRecordEntry } from '@/services/user-service'; // Assuming this service exists

type RecordType = 'visitSummaries' | 'immunizationRecords' | 'labResults';

// Simplified form state for adding records
interface NewRecordFormState {
  visitDate?: Date;
  clinicName?: string;
  reasonForVisit?: string;
  vaccineName?: string;
  dateAdministered?: Date;
  testName?: string;
  resultDate?: Date;
  [key: string]: any; // For other fields
}


export default function HealthRecordDisplay() {
  const { user, userProfile, loading: authLoading, refreshUserProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false); // For add operation
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [currentRecordType, setCurrentRecordType] = useState<RecordType | null>(null);
  const [newRecordData, setNewRecordData] = useState<NewRecordFormState>({});

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-muted-foreground">Loading your health record...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>Please log in to view your health record.</AlertDescription>
      </Alert>
    );
  }

  if (!userProfile) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Profile Not Found</AlertTitle>
        <AlertDescription>We couldn't find your health profile. Please complete onboarding or contact support.</AlertDescription>
      </Alert>
    );
  }
  
  const openAddDialog = (type: RecordType) => {
    setCurrentRecordType(type);
    setNewRecordData({}); // Reset form
    setIsAddDialogOpen(true);
  };

  const handleFormInputChange = (field: string, value: any) => {
    setNewRecordData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentRecordType) return;

    setIsLoading(true);
    try {
      let entryData: any = { ...newRecordData };
      // Convert dates to Timestamps
      if (currentRecordType === 'visitSummaries' && newRecordData.visitDate) {
        entryData.visitDate = Timestamp.fromDate(newRecordData.visitDate);
      } else if (currentRecordType === 'immunizationRecords' && newRecordData.dateAdministered) {
        entryData.dateAdministered = Timestamp.fromDate(newRecordData.dateAdministered);
      } else if (currentRecordType === 'labResults' && newRecordData.resultDate) {
        entryData.resultDate = Timestamp.fromDate(newRecordData.resultDate);
      }
      
      // Basic validation (can be expanded)
      if (currentRecordType === 'visitSummaries' && (!entryData.visitDate || !entryData.clinicName || !entryData.reasonForVisit)) {
        toast({ title: "Missing Fields", description: "Date, clinic name, and reason are required for visit summaries.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
       if (currentRecordType === 'immunizationRecords' && (!entryData.vaccineName || !entryData.dateAdministered)) {
        toast({ title: "Missing Fields", description: "Vaccine name and date are required for immunizations.", variant: "destructive" });
        setIsLoading(false);
        return;
      }
       if (currentRecordType === 'labResults' && (!entryData.testName || !entryData.resultDate)) {
        toast({ title: "Missing Fields", description: "Test name and date are required for lab results.", variant: "destructive" });
        setIsLoading(false);
        return;
      }


      await addHealthRecordEntry(user.uid, currentRecordType, entryData);
      toast({ title: "Record Added", description: `${currentRecordType.replace(/([A-Z])/g, ' $1').trim()} entry added successfully.` });
      await refreshUserProfile(); // Refresh profile to show new data
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding health record:", error);
      toast({ title: "Error", description: `Failed to add record: ${error instanceof Error ? error.message : 'Unknown error'}`, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const renderRecordFields = () => {
    switch (currentRecordType) {
      case 'visitSummaries':
        return (
          <>
            <div className="grid gap-2">
              <Label htmlFor="visitDate">Visit Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newRecordData.visitDate ? format(newRecordData.visitDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={newRecordData.visitDate} onSelect={(date) => handleFormInputChange('visitDate',date)} initialFocus /></PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2"><Label htmlFor="clinicName">Clinic Name *</Label><Input id="clinicName" value={newRecordData.clinicName || ''} onChange={e => handleFormInputChange('clinicName', e.target.value)} required /></div>
            <div className="grid gap-2"><Label htmlFor="doctorName">Doctor Name</Label><Input id="doctorName" value={newRecordData.doctorName || ''} onChange={e => handleFormInputChange('doctorName', e.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="reasonForVisit">Reason for Visit *</Label><Textarea id="reasonForVisit" value={newRecordData.reasonForVisit || ''} onChange={e => handleFormInputChange('reasonForVisit', e.target.value)} required /></div>
            <div className="grid gap-2"><Label htmlFor="diagnosis">Diagnosis</Label><Textarea id="diagnosis" value={newRecordData.diagnosis || ''} onChange={e => handleFormInputChange('diagnosis', e.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="treatmentPlan">Treatment Plan</Label><Textarea id="treatmentPlan" value={newRecordData.treatmentPlan || ''} onChange={e => handleFormInputChange('treatmentPlan', e.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="notes">Notes</Label><Textarea id="notes" value={newRecordData.notes || ''} onChange={e => handleFormInputChange('notes', e.target.value)} /></div>
          </>
        );
      case 'immunizationRecords':
        return (
          <>
            <div className="grid gap-2"><Label htmlFor="vaccineName">Vaccine Name *</Label><Input id="vaccineName" value={newRecordData.vaccineName || ''} onChange={e => handleFormInputChange('vaccineName', e.target.value)} required /></div>
            <div className="grid gap-2">
              <Label htmlFor="dateAdministered">Date Administered *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newRecordData.dateAdministered ? format(newRecordData.dateAdministered, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={newRecordData.dateAdministered} onSelect={(date) => handleFormInputChange('dateAdministered', date)} initialFocus /></PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2"><Label htmlFor="doseNumber">Dose Number</Label><Input id="doseNumber" value={newRecordData.doseNumber || ''} onChange={e => handleFormInputChange('doseNumber', e.target.value)} placeholder="e.g., 1st, Booster" /></div>
            <div className="grid gap-2"><Label htmlFor="administeredBy">Administered By</Label><Input id="administeredBy" value={newRecordData.administeredBy || ''} onChange={e => handleFormInputChange('administeredBy', e.target.value)} placeholder="Clinic or Health Worker"/></div>
            <div className="grid gap-2"><Label htmlFor="batchNumber">Batch Number</Label><Input id="batchNumber" value={newRecordData.batchNumber || ''} onChange={e => handleFormInputChange('batchNumber', e.target.value)} /></div>
          </>
        );
      case 'labResults':
        return (
          <>
            <div className="grid gap-2"><Label htmlFor="testName">Test Name *</Label><Input id="testName" value={newRecordData.testName || ''} onChange={e => handleFormInputChange('testName', e.target.value)} required /></div>
             <div className="grid gap-2">
              <Label htmlFor="resultDate">Result Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {newRecordData.resultDate ? format(newRecordData.resultDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={newRecordData.resultDate} onSelect={(date) => handleFormInputChange('resultDate', date)} initialFocus /></PopoverContent>
              </Popover>
            </div>
            <div className="grid gap-2"><Label htmlFor="value">Value</Label><Input id="value" value={newRecordData.value || ''} onChange={e => handleFormInputChange('value', e.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="units">Units</Label><Input id="units" value={newRecordData.units || ''} onChange={e => handleFormInputChange('units', e.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="referenceRange">Reference Range</Label><Input id="referenceRange" value={newRecordData.referenceRange || ''} onChange={e => handleFormInputChange('referenceRange', e.target.value)} /></div>
            <div className="grid gap-2"><Label htmlFor="interpretation">Interpretation</Label><Input id="interpretation" value={newRecordData.interpretation || ''} onChange={e => handleFormInputChange('interpretation', e.target.value)} placeholder="e.g., Normal, High, Low"/></div>
            <div className="grid gap-2"><Label htmlFor="labName">Lab Name</Label><Input id="labName" value={newRecordData.labName || ''} onChange={e => handleFormInputChange('labName', e.target.value)} /></div>
            {/* FilePath for lab results is usually handled via actual file upload, not manual input in this form */}
          </>
        );
      default: return null;
    }
  };

  const { visitSummaries = [], immunizationRecords = [], labResults = [] } = userProfile;

  return (
    <div className="space-y-8">
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Add New {currentRecordType?.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).slice(0,-1)} Record</DialogTitle>
            <DialogDescription>Fill in the details for the new health record. Fields marked * are required.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddRecordSubmit} className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            {renderRecordFields()}
          
            <DialogFooter className="mt-4 sticky bottom-0 bg-background py-4">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isLoading}>Cancel</Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Record
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="flex items-center gap-2">
            <NotebookText className="h-6 w-6 text-primary" />
            <CardTitle>Visit Summaries</CardTitle>
          </div>
          <Button size="sm" onClick={() => openAddDialog('visitSummaries')}><PlusCircle className="mr-2 h-4 w-4" /> Add Visit</Button>
        </CardHeader>
        <CardContent>
          {visitSummaries.length === 0 ? (
            <p className="text-muted-foreground">No visit summaries recorded yet.</p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {visitSummaries.map((summary, index) => (
                <AccordionItem value={`visit-${index}`} key={summary.id}>
                  <AccordionTrigger className="hover:bg-muted/50 px-2 rounded-md">
                    {format((summary.visitDate as Timestamp).toDate(), 'PPP')} - {summary.clinicName} ({summary.reasonForVisit.substring(0,30)}{summary.reasonForVisit.length > 30 ? '...' : ''})
                  </AccordionTrigger>
                  <AccordionContent className="px-2 pt-2 space-y-1 text-sm">
                    <p><strong>Date:</strong> {format((summary.visitDate as Timestamp).toDate(), 'MMMM d, yyyy')}</p>
                    <p><strong>Clinic:</strong> {summary.clinicName}</p>
                    {summary.doctorName && <p><strong>Doctor:</strong> {summary.doctorName}</p>}
                    <p><strong>Reason:</strong> {summary.reasonForVisit}</p>
                    {summary.diagnosis && <p><strong>Diagnosis:</strong> {summary.diagnosis}</p>}
                    {summary.treatmentPlan && <p><strong>Treatment Plan:</strong> {summary.treatmentPlan}</p>}
                    {summary.notes && <p><strong>Notes:</strong> {summary.notes}</p>}
                     <p className="text-xs text-muted-foreground pt-1">Recorded: {format((summary.createdAt as Timestamp).toDate(), 'PPp')}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row justify-between items-center">
           <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-600" />
            <CardTitle>Immunization Records</CardTitle>
          </div>
          <Button size="sm" variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700" onClick={() => openAddDialog('immunizationRecords')}><PlusCircle className="mr-2 h-4 w-4" /> Add Immunization</Button>
        </CardHeader>
        <CardContent>
          {immunizationRecords.length === 0 ? (
            <p className="text-muted-foreground">No immunization records found.</p>
          ) : (
             <Accordion type="single" collapsible className="w-full">
              {immunizationRecords.map((record, index) => (
                <AccordionItem value={`immunization-${index}`} key={record.id}>
                  <AccordionTrigger className="hover:bg-muted/50 px-2 rounded-md">
                    {record.vaccineName} - {format((record.dateAdministered as Timestamp).toDate(), 'PPP')}
                  </AccordionTrigger>
                  <AccordionContent className="px-2 pt-2 space-y-1 text-sm">
                    <p><strong>Vaccine:</strong> {record.vaccineName}</p>
                    <p><strong>Date Administered:</strong> {format((record.dateAdministered as Timestamp).toDate(), 'MMMM d, yyyy')}</p>
                    {record.doseNumber && <p><strong>Dose:</strong> {record.doseNumber}</p>}
                    {record.administeredBy && <p><strong>Administered By:</strong> {record.administeredBy}</p>}
                    {record.batchNumber && <p><strong>Batch No:</strong> {record.batchNumber}</p>}
                     <p className="text-xs text-muted-foreground pt-1">Recorded: {format((record.createdAt as Timestamp).toDate(), 'PPp')}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row justify-between items-center">
           <div className="flex items-center gap-2">
            <Microscope className="h-6 w-6 text-blue-600" />
            <CardTitle>Lab Results</CardTitle>
          </div>
           <Button size="sm" variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700" onClick={() => openAddDialog('labResults')}><PlusCircle className="mr-2 h-4 w-4" /> Add Lab Result</Button>
        </CardHeader>
        <CardContent>
          {labResults.length === 0 ? (
            <p className="text-muted-foreground">No lab results available.</p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {labResults.map((result, index) => (
                <AccordionItem value={`lab-${index}`} key={result.id}>
                  <AccordionTrigger className="hover:bg-muted/50 px-2 rounded-md">
                    {result.testName} - {format((result.resultDate as Timestamp).toDate(), 'PPP')}
                  </AccordionTrigger>
                  <AccordionContent className="px-2 pt-2 space-y-1 text-sm">
                    <p><strong>Test Name:</strong> {result.testName}</p>
                    <p><strong>Result Date:</strong> {format((result.resultDate as Timestamp).toDate(), 'MMMM d, yyyy')}</p>
                    {result.value && <p><strong>Value:</strong> {result.value} {result.units || ''}</p>}
                    {result.referenceRange && <p><strong>Reference Range:</strong> {result.referenceRange}</p>}
                    {result.interpretation && <p><strong>Interpretation:</strong> {result.interpretation}</p>}
                    {result.labName && <p><strong>Lab:</strong> {result.labName}</p>}
                    {result.filePath && <p><strong>File:</strong> <a href={result.filePath} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View File</a></p>}
                    <p className="text-xs text-muted-foreground pt-1">Recorded: {format((result.createdAt as Timestamp).toDate(), 'PPp')}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
      <Alert variant="default" className="mt-8">
        <FileText className="h-4 w-4" />
        <AlertTitle>Note on Data Management</AlertTitle>
        <AlertDescription>
          This is a prototype for viewing your health records. For actual medical use, ensure data accuracy with your healthcare provider. WhatsApp and USSD access are conceptual features for future development.
        </AlertDescription>
      </Alert>
    </div>
  );
}
