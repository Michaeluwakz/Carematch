
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Brain, ShieldCheck, BriefcaseMedical, Compass, ArrowRight, HeartPulse } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center text-center space-y-12">
      <section className="space-y-4 mt-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-primary">
          CareMatch AI
        </h1>
        <p className="text-lg sm:text-xl text-foreground/80">
          Your compassionate AI Doctor in navigating healthcare simply and clearly.
        </p>
      </section>
      <Image 
        src="https://cdn.pixabay.com/photo/2024/09/17/02/28/ai-generated-9052691_1280.jpg" 
        alt="AI in healthcare" 
        width={600} 
        height={400} 
        className="rounded-lg shadow-xl"
        data-ai-hint="AI healthcare"
        priority
      />
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-2xl text-primary">
              <Zap className="h-7 w-7" /> 
              AI Companion
            </CardTitle>
            <CardDescription className="text-base">
              Your smart health partner: for symptom checks, health advice, appointment assistance, and navigating care options. Speaks your language.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/health-assistant">
                <span>Chat with Companion <ArrowRight className="ml-2 h-4 w-4" /></span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-2xl text-primary">
              <Brain className="h-7 w-7" />
              Mental Health Support
            </CardTitle>
            <CardDescription className="text-base">
              A supportive space to share thoughts and feelings. Get empathetic responses and gentle suggestions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/mental-health-companion">
                <span>Find Support <ArrowRight className="ml-2 h-4 w-4" /></span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-2xl text-primary">
              <BriefcaseMedical className="h-7 w-7" />
              Health Tools
            </CardTitle>
            <CardDescription className="text-base">
              Upload insurance cards, prescriptions, or lab reports. Our AI extracts key info and explains it clearly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/document-parser">
                <span>Use Document Parser <ArrowRight className="ml-2 h-4 w-4" /></span>
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-2xl text-primary">
              <Compass className="h-7 w-7" />
              Care Navigator
            </CardTitle>
            <CardDescription className="text-base">
              Search for doctors, specialists, clinics, and hospitals in your area based on your specific needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/care-navigator">
                <span>Find Care Options <ArrowRight className="ml-2 h-4 w-4" /></span>
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-2xl text-primary">
              <HeartPulse className="h-7 w-7" />
              Health Records & More
            </CardTitle>
            <CardDescription className="text-base">
              Access your health records, manage reminders, and view notifications all in one place.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/my-health-record">
                <span>View My Health <ArrowRight className="ml-2 h-4 w-4" /></span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
    
