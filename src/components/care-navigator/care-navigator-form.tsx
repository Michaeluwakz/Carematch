
"use client";

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { careNavigationFlow, type CareNavigationInput, type CareNavigationOutput, type ClinicForCareNavigation } from '@/ai/flows/care-navigation-flow';
import { Loader2, Compass, ListChecks, AlertCircle, Hospital, BookOpen, UserCheck, ListTree, CheckCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export function CareNavigatorForm() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [language, setLanguage] = useState('English');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');

  const [result, setResult] = useState<CareNavigationOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      setError("Please describe your health needs or symptoms.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const input: CareNavigationInput = {
        userInput: query,
        userLocation: location || undefined,
        preferredLanguage: language,
        userAge: age ? parseInt(age, 10) : undefined,
        userSex: sex === 'not_specified' ? undefined : sex || undefined,
      };
      const navigationResult = await careNavigationFlow(input);
      setResult(navigationResult);
      toast({
        title: "Care Plan Suggested",
        description: "We've generated a set of recommendations for you.",
      });
    } catch (err) {
      console.error("Error in care navigation:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to generate care plan: ${errorMessage}`);
      toast({
        title: "Navigation Failed",
        description: `Could not generate care plan. ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectClinic = (clinic: ClinicForCareNavigation) => {
    console.log("Selected clinic:", clinic);
    // Here you would typically navigate to a details page,
    // open a modal, or trigger another action (e.g. booking/assistance request).
    toast({
      title: `Clinic Selected: ${clinic.name}`,
      description: "Further actions like booking or requesting assistance for this clinic can be implemented here.",
    });
  };

  // Add the list of Federal Medical Centres
  const federalMedicalCentres = [
    "Federal Medical Centre, Abeokuta, Ogun State",
    "Federal Medical Centre, Asaba, Delta State",
    "Federal Medical Centre, Azare, Bauchi State",
    "Federal Medical Centre, Bida, Niger State",
    "Federal Medical Centre, Birnin Kudu, Jigawa State",
    "Federal Medical Centre, Ebute Metta, Lagos State",
    "Federal Medical Centre, Epe, Lagos State",
    "Federal Medical Centre, Daura, Katsina State",
    "Federal Medical Centre, Gusau, Zamfara State",
    "Federal Medical Centre, Hong, Adamawa State",
    "Federal Medical Centre, Ikole-Ekiti, Ekiti State",
    "Federal Medical Centre, Jabi - Abuja, FCT",
    "Federal Medical Centre, Jalingo, Taraba State",
    "Federal Medical Centre, Keffi, Nasarawa State",
    "Federal Medical Centre, Makurdi, Benue State",
    "Federal Medical Centre, Misau, Bauchi State",
    "Federal Medical Centre, Mubi, Adamawa State",
    "Federal Medical Centre, New Bussa, Niger State",
    "Federal Medical Centre, Nguru, Yobe State",
    "Federal Medical Centre, Onitsha, Anambra State",
    "Federal Medical Centre, Owo, Ondo State",
    "Federal Medical Centre, Umuahia, Abia State",
    "Federal Medical Centre, Wase, Plateau State",
    "Federal Medical Centre, Yenagoa, Bayelsa State",
  ];

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary flex items-center gap-2">
          <Compass className="h-6 w-6" />
          Care Navigator
        </CardTitle>
        <CardDescription>
          Describe your health needs, or paste a URL to get a summary and information.
        </CardDescription>
        {/* Removed Federal Medical Centres List */}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="query">Your Health Needs or URL *</Label>
            <Textarea
              id="query"
              placeholder="e.g., 'What are the main takeaways from this article? https://www.cdc.gov/diabetes/basics/index.html' or 'I have a persistent cough and need a clinic near downtown.'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={4}
              required
              disabled={isLoading}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Your Location (Optional)</Label>
              <Input
                id="location"
                type="text"
                placeholder="e.g., 'Springfield, IL' or '90210'"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isLoading}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="language">Preferred Language</Label>
              <Select value={language} onValueChange={setLanguage} disabled={isLoading}>
                <SelectTrigger id="language-select" className="mt-1">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Spanish">Español</SelectItem>
                  <SelectItem value="French">Français</SelectItem>
                  <SelectItem value="Hindi">हिन्दी</SelectItem>
                  <SelectItem value="Swahili">Kiswahili</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age">Your Age (Optional)</Label>
              <Input
                id="age"
                type="number"
                placeholder="e.g., 35"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                disabled={isLoading}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="sex">Your Sex (Optional)</Label>
              <Select value={sex} onValueChange={setSex} disabled={isLoading}>
                <SelectTrigger id="sex-select" className="mt-1">
                  <SelectValue placeholder="Select sex (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_specified">Prefer not to say</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Button type="submit" disabled={isLoading || !query.trim()} className="w-full bg-primary hover:bg-primary/90">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ListChecks className="mr-2 h-4 w-4" />
            )}
            Find Care Options
          </Button>
        </form>
      </CardContent>
      
      {result && (
        <CardFooter className="flex flex-col items-start gap-6 pt-6 border-t mt-6">
          <h3 className="text-lg font-semibold text-primary">Your Personalized Recommendations:</h3>
          
          <Card className="w-full bg-background">
            <CardHeader>
              <CardTitle className="text-md">Summary & Suggested Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap mb-4">{result.summary}</p>
              {result.suggestedSteps && result.suggestedSteps.length > 0 && (
                <>
                  <h4 className="font-semibold mb-2 text-sm">Next Steps:</h4>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {result.suggestedSteps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </>
              )}
            </CardContent>
          </Card>

          {result.relevantClinics && result.relevantClinics.length > 0 && (
            <Card className="w-full bg-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-md">
                  <Hospital className="h-5 w-5 text-primary" />
                  Suggested Clinics/Hospitals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.relevantClinics.map((clinic) => (
                  <Card 
                    key={clinic.id} 
                    className="p-4 shadow-md hover:shadow-lg transition-shadow duration-200 border border-border"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-grow">
                            <h4 className="font-semibold text-primary text-base">{clinic.name}</h4>
                            <p className="text-sm text-muted-foreground">{clinic.address}</p>
                            {clinic.distanceKm !== undefined && <p className="text-xs mt-1 text-muted-foreground">Distance: {clinic.distanceKm.toFixed(1)} km</p>}
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-accent hover:bg-accent/90 text-accent-foreground flex-shrink-0 w-full sm:w-auto"
                            onClick={() => handleSelectClinic(clinic)}
                        >
                            <CheckCircle className="mr-2 h-4 w-4" /> Select
                        </Button>
                    </div>
                    {clinic.services && clinic.services.length > 0 && (
                      <p className="text-sm mt-2 pt-2 border-t border-border">
                        <strong>Services:</strong> {clinic.services.join(', ')}
                      </p>
                    )}
                    <p className="text-sm mt-1">
                        <strong>Walk-ins:</strong> {clinic.acceptsWalkIn ? 
                          <span className="text-green-600 font-medium">Accepted</span> : 
                          <span className="text-red-600 font-medium">Not accepted / By appointment</span>
                        }
                    </p>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}

          {result.healthInformation && result.healthInformation.length > 0 && (
            <Card className="w-full bg-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-md">
                  <BookOpen className="h-5 w-5 text-accent" />
                  Relevant Health Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.healthInformation.map((topic) => (
                  <div key={topic.Id} className="pb-2 border-b last:border-b-0">
                    <h4 className="font-semibold text-sm">{topic.Title}</h4>
                    {topic.AccessibleVersion && (
                      <a 
                        href={topic.AccessibleVersion} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-primary hover:underline"
                      >
                        Read more
                      </a>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {result.personalizedRecommendations && result.personalizedRecommendations.length > 0 && (
            <Card className="w-full bg-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-md">
                  <UserCheck className="h-5 w-5 text-green-600" />
                  Personalized Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.personalizedRecommendations.map((item, index) => (
                  <div key={item.Id || `pr-${index}-${item.Title.substring(0,10)}`} className="pb-2 border-b last:border-b-0">
                    <h4 className="font-semibold text-sm">{item.Title}</h4>
                    {item.AccessibleVersion && (
                      <a 
                        href={item.AccessibleVersion} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs text-primary hover:underline"
                      >
                        Read more
                      </a>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {result.generalResources && result.generalResources.length > 0 && (
            <Card className="w-full bg-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-md">
                  <ListTree className="h-5 w-5 text-purple-600" />
                  General Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {result.generalResources.map((item) => (
                  <div key={item.Id} className="pb-2 border-b last:border-b-0">
                    <h4 className="font-semibold text-sm">{item.Title}</h4>
                    {/* Assuming general resources might not always have a direct link in this basic schema */}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

        </CardFooter>
      )}
    </Card>
  );
}
