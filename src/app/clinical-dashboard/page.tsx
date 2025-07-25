
import type { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LayoutDashboard, Users, BarChart3, AlertTriangle, ShieldAlert, Activity, TrendingUp, ListFilter } from 'lucide-react';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Clinical Dashboard - CareMatch AI',
  description: 'Dashboard for medical professionals to analyze patient data, review AI insights, and manage care escalations.',
};

export default function ClinicalDashboardPage() {
  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8" />
            Clinical Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            For authorized medical professionals. Analyze patient records, review AI-assisted insights, and manage care escalations.
          </p>
        </div>
        {/* Placeholder for potential global actions like date range filter or export */}
      </div>

      <Alert variant="destructive" className="bg-yellow-50 border-yellow-300 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300">
        <ShieldAlert className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        <AlertTitle className="font-semibold">Access Restricted & Under Development</AlertTitle>
        <AlertDescription>
          This dashboard is intended for authorized medical personnel only. The features and data displayed are currently illustrative placeholders for development purposes. Real patient data is not yet connected.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-6 w-6 text-primary" />
              Patient Cohort Overview
            </CardTitle>
            <CardDescription>Demographics, conditions, and key metrics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Patient distribution charts and statistics will appear here.</p>
            <div className="aspect-[16/9] bg-muted rounded-md flex items-center justify-center">
               <Image src="https://placehold.co/600x338.png?text=Demographics+Chart" alt="Demographics Chart Placeholder" width={600} height={338} className="rounded-md object-cover" data-ai-hint="demographics chart" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Activity className="h-6 w-6 text-destructive" />
              Active Escalations & Alerts
            </CardTitle>
            <CardDescription>Review and manage patient cases needing urgent attention.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">A prioritized list of escalated cases and critical alerts will be displayed here.</p>
             <div className="mt-2 p-3 border rounded-md bg-muted/50">
                <p className="font-medium text-sm">Case #ESC-00123 - High Urgency</p>
                <p className="text-xs text-muted-foreground">Patient: J. Doe - Symptoms: Chest Pain</p>
            </div>
             <div className="mt-2 p-3 border rounded-md bg-muted/50">
                <p className="font-medium text-sm">Case #ESC-00124 - Medium Urgency</p>
                <p className="text-xs text-muted-foreground">Patient: A. Smith - Symptoms: Persistent Fever</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="h-6 w-6 text-accent" />
              Population Health Trends
            </CardTitle>
            <CardDescription>Identify symptom patterns and disease hotspots.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Visualizations of regional health trends and potential outbreaks based on anonymized data.</p>
            <div className="aspect-[16/9] bg-muted rounded-md flex items-center justify-center">
               <Image src="https://placehold.co/600x338.png?text=Trend+Heatmap" alt="Trend Heatmap Placeholder" width={600} height={338} className="rounded-md object-cover" data-ai-hint="trend heatmap" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ListFilter className="h-6 w-6 text-primary" />
              Data Filters & Reporting
            </CardTitle>
            <CardDescription>Filter data and generate reports.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Controls for filtering patient cohorts, date ranges, and generating downloadable reports will be available here.</p>
             <div className="mt-2 space-y-2">
                <button className="w-full text-sm p-2 border rounded-md hover:bg-muted transition-colors">Filter by Condition</button>
                <button className="w-full text-sm p-2 border rounded-md hover:bg-muted transition-colors">Generate Weekly Report</button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-2 lg:col-span-2">
           <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="h-6 w-6 text-primary" />
              Risk Stratification Analysis
            </CardTitle>
            <CardDescription>AI-powered insights into patient risk levels and predictive analytics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">Interactive charts showing patient risk scores and factors contributing to risk. For example, a scatter plot of patients by risk level and recent activity.</p>
            <div className="aspect-[20/9] bg-muted rounded-md flex items-center justify-center">
              <Image src="https://placehold.co/800x360.png?text=Risk+Visualization" alt="Risk Visualization Placeholder" width={800} height={360} className="rounded-md object-cover" data-ai-hint="risk chart" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Future Development</AlertTitle>
        <AlertDescription>
          This dashboard will be expanded with real-time data integration, advanced analytics, secure patient record access, role-based controls, and compliance features for clinical use.
        </AlertDescription>
      </Alert>
    </div>
  );
}
