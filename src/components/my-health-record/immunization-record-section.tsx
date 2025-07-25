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
import { Calendar as CalendarIcon, PlusCircle, Syringe } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import type { ImmunizationRecord } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';

interface ImmunizationRecordSectionProps {
  immunizationRecords: ImmunizationRecord[];
  onAddImmunizationRecord: (newEntryData: Omit<ImmunizationRecord, 'id' | 'createdAt'>) => Promise<string | null>;
}

const ImmunizationRecordSection: React.FC<ImmunizationRecordSectionProps> = ({ immunizationRecords, onAddImmunizationRecord }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newVaccineName, setNewVaccineName] = useState('');
  const [newDateAdministered, setNewDateAdministered] = useState<Date | undefined>(new Date());
  const [newDoseNumber, setNewDoseNumber] = useState('');
  const [newAdministeredBy, setNewAdministeredBy] = useState('');
  const [newBatchNumber, setNewBatchNumber] = useState('');
  const { toast } = useToast();

  const handleAddImmunizationRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVaccineName.trim() || !newDateAdministered) {
      toast({ title: "Missing Information", description: "Vaccine name and date administered are required.", variant: "destructive" });
      return;
    }

    try {
      const newEntryId = await onAddImmunizationRecord({
        vaccineName: newVaccineName,
        dateAdministered: Timestamp.fromDate(newDateAdministered), // Convert Date to Timestamp
        doseNumber: newDoseNumber,
        administeredBy: newAdministeredBy,
        batchNumber: newBatchNumber,
      });
      if (newEntryId) {
        toast({ title: "Immunization Record Added", description: "Your new immunization record has been saved." });
        setIsAddDialogOpen(false);
        resetAddImmunizationRecordForm();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Could not add immunization record.";
      toast({ title: "Error Adding Immunization Record", description: errorMessage, variant: "destructive" });
    }
  };

  const resetAddImmunizationRecordForm = () => {
    setNewVaccineName('');
    setNewDateAdministered(new Date());
    setNewDoseNumber('');
    setNewAdministeredBy('');
    setNewBatchNumber('');
  };

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
          <Syringe className="h-6 w-6" /> Immunization Records
        </h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <PlusCircle className="mr-2 h-5 w-5" /> Add Immunization
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Add New Immunization Record</DialogTitle>
              <DialogDescription>
                Fill in the details for your immunization. Fields marked * are required.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddImmunizationRecord} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="vaccineName">Vaccine Name *</Label>
                <Input id="vaccineName" value={newVaccineName} onChange={(e) => setNewVaccineName(e.target.value)} placeholder="e.g., Influenza" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="dateAdministered">Date Administered *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${!newDateAdministered && "text-muted-foreground"}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newDateAdministered ? format(newDateAdministered, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newDateAdministered}
                      onSelect={setNewDateAdministered}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="doseNumber">Dose Number (Optional)</Label>
                <Input id="doseNumber" value={newDoseNumber} onChange={(e) => setNewDoseNumber(e.target.value)} placeholder="e.g., 1st, Booster" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="administeredBy">Administered By (Optional)</Label>
                <Input id="administeredBy" value={newAdministeredBy} onChange={(e) => setNewAdministeredBy(e.target.value)} placeholder="e.g., City Health Clinic" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="batchNumber">Batch Number (Optional)</Label>
                <Input id="batchNumber" value={newBatchNumber} onChange={(e) => setNewBatchNumber(e.target.value)} placeholder="e.g., AB1234" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={!newVaccineName.trim() || !newDateAdministered}>
                  Save Record
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {immunizationRecords.length === 0 ? (
        <Card className="text-center py-8 shadow-md">
          <CardContent>
            <Syringe className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg text-muted-foreground">No immunization records added yet.</p>
            <p className="text-sm text-muted-foreground">Click "Add Immunization" to add a new entry.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {immunizationRecords.map(record => (
            <Card key={record.id} className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-lg">{record.vaccineName}</CardTitle>
                <CardDescription>
                  Administered on {record.dateAdministered instanceof Timestamp ? format(record.dateAdministered.toDate(), "PPP") : "Invalid Date"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {record.doseNumber && <p>Dose: {record.doseNumber}</p>}
                {record.administeredBy && <p>Administered By: {record.administeredBy}</p>}
                {record.batchNumber && <p>Batch Number: {record.batchNumber}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};

export default ImmunizationRecordSection;





