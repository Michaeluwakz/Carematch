'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const articles = [
  {
    title: 'Understanding Asthma: Symptoms and Treatment',
    summary: 'Learn about asthma symptoms, triggers, and effective treatment strategies.',
    url: 'https://www.lung.org/lung-health-diseases/lung-disease-lookup/asthma/learn-about-asthma',
    source: 'American Lung Association',
  },
  {
    title: 'Healthy Eating for a Strong Heart',
    summary: 'Discover dietary tips and meal plans to support cardiovascular health.',
    url: 'https://www.heart.org/en/healthy-living/healthy-eating',
    source: 'American Heart Association',
  },
  {
    title: 'Managing Depression: Tips and Resources',
    summary: 'Explore practical tips and trusted resources for managing depression.',
    url: 'https://www.nimh.nih.gov/health/topics/depression',
    source: 'National Institute of Mental Health',
  },
  {
    title: 'How to navigate a chronic illness',
    summary: 'Guidance and personal stories for living with chronic illness, including practical tips for patients and supporters.',
    url: 'https://www.vox.com/even-better/2023/12/17/23961273/chronic-illness-covid-19-diagnosis-help-support?utm_source=pocket_saves',
    source: 'Vox',
  },
  {
    title: 'How to navigate the healthcare system as a first-time patient',
    summary: 'A practical guide for new patients to confidently navigate healthcare.',
    url: 'https://www.willowshealthcare.com/blog/how-to-navigate-the-healthcare-system-as-a-first-time-patient',
    source: 'Willows Healthcare',
  },
  {
    title: 'Decoding your medical bill: What those charges really mean',
    summary: 'Understand your medical bills and learn how to avoid overpaying.',
    url: 'https://kevinmd.com/2025/07/decoding-your-medical-bill-what-those-charges-really-mean.html',
    source: 'KevinMD',
  },
  {
    title: 'When the cycle stops',
    summary: 'A visual and narrative exploration of amenorrhea and its health impacts.',
    url: 'https://www.reuters.com/graphics/USA-HEALTH/AMENORRHEA/dwpklrkaxvm/',
    source: 'Reuters',
  },
  {
    title: 'Supporting autistic patients with inclusive and predictable care',
    summary: 'Tips for healthcare providers to support autistic patients effectively.',
    url: 'https://www.news-medical.net/news/20250714/Supporting-autistic-patients-with-inclusive-and-predictable-care.aspx',
    source: 'News-Medical',
  },
  {
    title: 'Mpox – African Region (2024)',
    summary: 'WHO reports on the 2024 mpox outbreak in Africa, its spread, affected countries, and public health response.',
    url: 'https://www.who.int/emergencies/disease-outbreak-news/item/2024-DON528',
    source: 'World Health Organization',
  },
  {
    title: 'WHO issues warning on falsified medicines used for diabetes treatment and weight loss',
    summary: 'WHO warns about falsified semaglutide (Ozempic) medicines, risks, and how to avoid harm.',
    url: 'https://www.who.int/news/item/20-06-2024-who-issues-warning-on-falsified-medicines-used-for-diabetes-treatment-and-weight-loss',
    source: 'World Health Organization',
  },
  {
    title: 'Public Alert No. 01/2024 – Falsely labelled Ozempic (Semaglutide) Pens',
    summary: 'NAFDAC alerts the public about falsely labelled Ozempic pens, their risks, and what to do if encountered.',
    url: 'https://nafdac.gov.ng/public-alert-no-01-2024-alert-on-falsely-labelled-ozempic-semaglutide-1-mg-solution-for-injection-pens/',
    source: 'NAFDAC',
  },
  {
    title: 'High Cost Of Medicines: Federal Government Assures Nigerians Of Determination To Make Drugs Affordable',
    summary: 'NAFDAC and the Nigerian government discuss efforts and policies to make medicines more affordable for Nigerians.',
    url: 'https://nafdac.gov.ng/high-cost-of-medicines-federal-government-assures-nigerians-of-determination-to-make-drugs-affordable/',
    source: 'NAFDAC',
  },
  {
    title: 'Guide to the Best Foods for Hypertension (High Blood Pressure)',
    summary: 'Comprehensive, up-to-date guide on foods that help lower blood pressure, diet tips, serving sizes, and what to avoid. Includes DASH diet and snack ideas.',
    url: 'https://www.healthline.com/health/high-blood-pressure/guide-foods-for-hypertension-high-blood-pressure',
    source: 'Healthline',
  },
  {
    title: 'Dietary Intervention to Improve Blood Pressure Control: Beyond Salt Restriction',
    summary: 'A 2021 review of the DASH and Mediterranean diets, weight loss, and nutraceuticals for hypertension. Practical, evidence-based dietary advice.',
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8590666/',
    source: 'NCBI (Springer, 2021)',
  },
  {
    title: 'How To Lower High Blood Pressure Naturally - Doctor Reveals Science-Backed Tips',
    summary: 'Doctor Khalid explains practical, science-backed lifestyle and nutrition tips to lower blood pressure naturally, including foods, exercise, and stress management.',
    url: 'https://www.doctorkhalid.com/how-to-lower-high-blood-pressure-natrually-doctor-reveals/',
    source: 'Doctor Khalid (2024)',
  },
  {
    title: 'Effects of dietary approaches to prevent hypertension and enhance cardiovascular health',
    summary: '2025 review of how dietary choices, especially the Mediterranean diet, impact blood pressure and cardiovascular health. Includes practical meal plans and food lists.',
    url: 'https://link.springer.com/article/10.1007/s44187-025-00278-w',
    source: 'Springer (2025)',
  },
];

const aiResources = [
  {
    title: 'AI Symptom Checker',
    description: 'Use our AI-powered tool to check your symptoms and get personalized recommendations.',
    url: '/health-assistant',
  },
  {
    title: 'AI Health Insights',
    description: 'Get AI-generated insights from your health records and lifestyle data.',
    url: '/health-insights',
  },
  {
    title: 'AI Mental Health Companion',
    description: 'Chat with our AI companion for mental health support and resources.',
    url: '/mental-health-companion',
  },
];

const youtubeVideos = [
  {
    title: 'What is Diabetes? | Diabetes Education',
    videoId: 'wZAjVQWbMlE',
    description: '',
    source: '',
  },
  {
    title: 'How to Manage Stress Effectively',
    videoId: 'hnpQrMqDoqE',
    description: '',
    source: '',
  },
  {
    title: 'How does the immune system work? | Emma Bryce',
    videoId: 'zQGOcOUBi6s',
    description: '',
    source: '',
  },
  {
    title: 'What is Depression? | Psych Hub',
    videoId: 'XiCrniLQGYc',
    description: '',
    source: '',
  },
  {
    title: 'Why You Can’t Just ‘Get Over’ Trauma: The Science Behind Healing',
    videoId: 'vJf9zx1V22U',
    description: '',
    source: '',
  },
  {
    title: 'COVID-19 Symptoms and Prevention | WHO',
    videoId: '8c_UJwLq8PI',
    description: '',
    source: '',
  },
  {
    title: 'What is Anxiety? | Kati Morton',
    videoId: 'WWloIAQpMcQ',
    description: '',
    source: '',
  },
  {
    title: 'What is Mental Health? | World Health Organization',
    videoId: 'DxIDKZHW3-E',
    description: '',
    source: '',
  },
  {
    title: 'What are Infectious Diseases? | SciShow',
    videoId: 'Rpj0emEGShQ',
    description: '',
    source: '',
  },
  {
    title: 'What Exactly Is Typhoid Fever?',
    videoId: 'N1lKW2CYU68',
    description: '',
    source: '',
  },
  {
    title: 'Tuberculosis - causes, symptoms, diagnosis, treatment, pathology',
    videoId: '6P6zBHpWiGA',
    description: '',
    source: '',
  },
  {
    title: 'Which Healthcare System is Best? Crash Course Public Health #7',
    videoId: 'vxvhGj9fA3g',
    description: '',
    source: '',
  },
  {
    title: 'What is Public Health? Crash Course Public Health #1',
    videoId: '5aww-Bpgkf4',
    description: '',
    source: '',
  },
  {
    title: 'US Healthcare System Explained',
    videoId: 'DublqkOSBBA',
    description: '',
    source: '',
  },
  {
    title: 'Understanding Your Health Insurance Costs | Consumer Reports',
    videoId: 'DBTmNm8D-84',
    description: '',
    source: '',
  },
  {
    title: 'Top 10 Must Eat Foods To Lower Your Blood Pressure',
    videoId: 'q-nV_zwvRA0',
    description: 'Discover the top foods that can help lower your blood pressure, with practical nutrition tips.',
    source: 'Doctor Mike Hansen',
  },
  {
    title: 'Lower Blood Pressure NATURALLY: Doctor Explains',
    videoId: 'xmi9qghwQEY',
    description: 'A doctor explains natural ways to lower blood pressure, including lifestyle and dietary changes.',
    source: 'Dr. Eric Berg DC',
  },
  {
    title: 'Daily habit to lower blood pressure, improve heart health and reduce dementia risk | Tim Spector',
    videoId: 'jnieAQMbkH4',
    description: 'Tim Spector discusses daily habits that can help lower blood pressure, improve heart health, and reduce dementia risk.',
    source: 'ZOE',
  },
  {
    title: 'How to manage high blood pressure without drugs',
    videoId: 'uuNvd53NHGw',
    description: 'Learn practical, drug-free strategies to manage high blood pressure, including lifestyle and dietary changes.',
    source: 'Harvard Health Publishing',
  },
];

const additionalResources = [
  {
    title: 'Mayo Clinic – Patient Care & Health Information',
    url: 'https://www.mayoclinic.org/patient-care-and-health-information',
    description: 'Trusted health information, guides, and tools from Mayo Clinic.'
  },
  {
    title: 'MedlinePlus – Health Topics',
    url: 'https://medlineplus.gov/healthtopics.html',
    description: 'Reliable, up-to-date health information from the U.S. National Library of Medicine.'
  },
  {
    title: 'National Institutes of Health (NIH) – Health Information',
    url: 'https://www.nih.gov/health-information',
    description: 'Research-based health information from the NIH.'
  },
  {
    title: 'Cleveland Clinic – Health Essentials',
    url: 'https://health.clevelandclinic.org/',
    description: 'Expert health tips, news, and patient stories.'
  },
  {
    title: 'Johns Hopkins Medicine – Health Library',
    url: 'https://www.hopkinsmedicine.org/health/',
    description: 'Comprehensive health library and patient resources.'
  },
  {
    title: 'NHS (UK) – Health A to Z',
    url: 'https://www.nhs.uk/conditions/',
    description: 'Authoritative health information and advice from the UK’s National Health Service.'
  },
  {
    title: 'KidsHealth from Nemours',
    url: 'https://kidshealth.org/',
    description: 'Health information for parents, kids, and teens.'
  },
  {
    title: 'Mental Health America',
    url: 'https://mhanational.org/',
    description: 'Comprehensive mental health information, screening tools, and support resources from the nation’s leading nonprofit.'
  },
];

export default function ResourcesPage() {
  const [search, setSearch] = React.useState('');

  // Helper to filter by keyword in any field
  const keywordFilter = (item: Record<string, string>, fields: string[]) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return fields.some((field: string) =>
      (item[field] || '').toLowerCase().includes(q)
    );
  };

  const filteredArticles = articles.filter(article =>
    keywordFilter(article, ['title', 'summary', 'source'])
  );
  const filteredAIResources = aiResources.filter(res =>
    keywordFilter(res, ['title', 'description'])
  );
  const filteredVideos = youtubeVideos.filter(vid =>
    keywordFilter(vid, ['title'])
  );
  const filteredAdditional = additionalResources.filter(res =>
    keywordFilter(res, ['title', 'description'])
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-primary">Healthcare Resources</h1>
      <div className="mb-8">
        <Input
          type="text"
          placeholder="Search articles, tools, videos, resources..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-xl mx-auto"
        />
      </div>
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Featured Articles</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {filteredArticles.length === 0 ? (
            <p className="text-muted-foreground col-span-2">No articles found.</p>
          ) : (
            filteredArticles.map((article, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle>{article.title}</CardTitle>
                  <CardDescription>{article.source}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-2 text-sm text-muted-foreground">{article.summary}</p>
                  <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Read More</a>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">AI-Generated Healthcare Tools</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {filteredAIResources.length === 0 ? (
            <p className="text-muted-foreground col-span-2">No tools found.</p>
          ) : (
            filteredAIResources.map((res, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle>{res.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2 text-sm text-muted-foreground">{res.description}</p>
                  <a href={res.url} className="text-blue-600 underline">Try Now</a>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Healthcare Videos</h2>
        <div className="grid gap-8 md:grid-cols-2">
          {filteredVideos.length === 0 ? (
            <p className="text-muted-foreground col-span-2">No videos found.</p>
          ) : (
            filteredVideos.map((vid, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle>{vid.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe
                      width="100%"
                      height="315"
                      src={`https://www.youtube.com/embed/${vid.videoId}`}
                      title={vid.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>
      {/* Additional Resources Section */}
      <section className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Suggested Additional Resources</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {filteredAdditional.length === 0 ? (
            <p className="text-muted-foreground col-span-2">No resources found.</p>
          ) : (
            filteredAdditional.map((res, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle>{res.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2 text-sm text-muted-foreground">{res.description}</p>
                  <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Visit Resource</a>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>
    </div>
  );
} 