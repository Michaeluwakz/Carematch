// Shared healthcare centres/practitioners data for directory and AI suggestions

export interface HealthcareCentre {
  id: string;
  name: string;
  address: string;
  website?: string; // Add website property
  services: string[];
  acceptsWalkIn: boolean;
  walkInPolicy?: string; // descriptive walk-in/appointment policy
  category: string;
  facilityType?: string;
  code?: string;
}

import nhiaPractitionersRaw from './nhia-hcps.json';

export const federalMedicalCentres: HealthcareCentre[] = [
  { id: 'fmc-abeokuta', name: 'Federal Medical Centre, Abeokuta, Ogun State', address: 'Abeokuta, Ogun State', website: 'https://www.fmcabeokuta.net/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Federal Medical Centre' },
  { id: 'fmc-asaba', name: 'Federal Medical Centre, Asaba, Delta State', address: 'Asaba, Delta State', website: 'https://fmcasaba.org/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Federal Medical Centre' },
  { id: 'fmc-azare', name: 'Federal Medical Centre, Azare, Bauchi State', address: 'Azare, Bauchi State', website: 'https://fmcazare.gov.ng/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Federal Medical Centre' },
  { id: 'fmc-bida', name: 'Federal Medical Centre, Bida, Niger State', address: 'Bida, Niger State', website: 'https://fmcbida.org/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Federal Medical Centre' },
  { id: 'fmc-birnin-gwari', name: 'Federal Medical Centre, Birnin Gwari, Kaduna State', address: 'Birnin Gwari, Kaduna State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Federal Medical Centre' },
  { id: 'fmc-birnin-kebbi', name: 'Federal Medical Centre, Birnin Kebbi, Kebbi State', address: 'Birnin Kebbi, Kebbi State', website: 'https://fmcbirninkebbi.gov.ng/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Federal Medical Centre' },
  { id: 'fmc-birnin-kudu', name: 'Federal Medical Centre, Birnin Kudu, Jigawa State', address: 'Birnin Kudu, Jigawa State', website: 'https://fmcbkd.gov.ng/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Federal Medical Centre' },
  { id: 'fmc-ebute-metta', name: 'Federal Medical Centre, Ebute-Metta, Lagos State', address: 'Ebute-Metta, Lagos State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Federal Medical Centre' },
  { id: 'fmc-efon-alaye', name: 'Federal Medical Centre, Efon Alaye, Ekiti State', address: 'Efon Alaye, Ekiti State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Federal Medical Centre' },
  { id: 'fmc-gusau', name: 'Federal Medical Centre, Gusau, Zamfara State', address: 'Gusau, Zamfara State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Federal Medical Centre' },
  { id: 'fmc-hong', name: 'Federal Medical Centre, Hong, Adamawa State', address: 'Hong, Adamawa State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Federal Medical Centre' },
  { id: 'fmc-idah', name: 'Federal Medical Centre, Idah, Kogi State', address: 'Idah, Kogi State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Federal Medical Centre' },
  { id: 'fmc-jalingo', name: 'Federal Medical Centre, Jalingo, Taraba State', address: 'Jalingo, Taraba State', website: 'https://www.fmcjalingo.gov.ng/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Federal Medical Centre' },
  { id: 'fmc-katsina', name: 'Federal Medical Centre, Katsina, Katsina State', address: 'Katsina, Katsina State', website: 'https://fthkatsina.gov.ng/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Federal Medical Centre' },
  { id: 'fmc-keffi', name: 'Federal Medical Centre, Keffi, Nasarawa State', address: 'Keffi, Nasarawa State', website: 'https://www.fmckeffi.gov.ng/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Federal Medical Centre' },
  { id: 'fmc-lokoja', name: 'Federal Medical Centre, Lokoja, Kogi State', address: 'Lokoja, Kogi State', website: 'https://fthlokoja.gov.ng/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Federal Medical Centre' },
  { id: 'fmc-makurdi', name: 'Federal Medical Centre, Makurdi, Benue State', address: 'Makurdi, Benue State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Federal Medical Centre' },
  { id: 'fmc-nguru', name: 'Federal Medical Centre, Nguru, Yobe State', address: 'Nguru, Yobe State', website: 'https://fmcnguru.gov.ng/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Federal Medical Centre' },
  { id: 'fmc-owerri', name: 'Federal Medical Centre, Owerri, Imo State', address: 'Owerri, Imo State', website: 'https://www.fthowerri.gov.ng/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Federal Medical Centre' },
  { id: 'fmc-owo', name: 'Federal Medical Centre, Owo, Ondo State', address: 'Owo, Ondo State', website: 'https://www.fmcowo.org.ng/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Federal Medical Centre' },
  { id: 'fmc-umuahia', name: 'Federal Medical Centre, Umuahia, Abia State', address: 'Umuahia, Abia State', website: 'https://www.fmc-umuahia.com.ng/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Federal Medical Centre' },
  { id: 'fmc-yenagoa', name: 'Federal Medical Centre, Yenagoa, Bayelsa State', address: 'Yenagoa, Bayelsa State', website: 'https://fmcyenagoa.org.ng/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Federal Medical Centre' },
  { id: 'fmc-yola', name: 'Federal Medical Centre, Yola, Adamawa State', address: 'Yola, Adamawa State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Federal Medical Centre' },
];

export const specialtyHospitals: HealthcareCentre[] = [
  { id: 'sh-kaduna-ear', name: 'National Ear Care Centre, Kaduna', address: 'Kaduna', website: 'https://necckaduna.com.ng/', services: ['ENT', 'Audiology'], acceptsWalkIn: true, category: 'Specialty Hospital' },
  { id: 'sh-kaduna-eye', name: 'National Eye Centre, Kaduna', address: 'Kaduna', website: 'https://eyecenter.gov.ng/', services: ['Ophthalmology'], acceptsWalkIn: true, category: 'Specialty Hospital' },
  { id: 'sh-aba-fistula', name: 'National Obstetric Fistula Centre, Aba, Abia State', address: 'Aba, Abia State', services: ['Obstetric Fistula Care'], acceptsWalkIn: true, category: 'Specialty Hospital' },
  { id: 'sh-abakaliki-fistula', name: 'National Obstetric Fistula Centre, Abakaliki, Ebonyi State', address: 'Abakaliki, Ebonyi State', website: 'http://www.nofic.org.ng/', services: ['Obstetric Fistula Care'], acceptsWalkIn: true, category: 'Specialty Hospital' },
  { id: 'sh-bauchi-fistula', name: 'National Obstetric Fistula Centre, Bauchi, Bauchi State', address: 'Bauchi, Bauchi State', services: ['Obstetric Fistula Care'], acceptsWalkIn: true, category: 'Specialty Hospital' },
  { id: 'sh-katsina-fistula', name: 'National Obstetric Fistula Centre, Katsina, Katsina State', address: 'Katsina, Katsina State', services: ['Obstetric Fistula Care'], acceptsWalkIn: true, category: 'Specialty Hospital' },
  { id: 'sh-kano-orthopaedic', name: 'National Orthopaedic Hospital, Dala-Kano', address: 'Dala-Kano', website: 'https://nohkano.gov.ng/', services: ['Orthopaedics'], acceptsWalkIn: true, category: 'Specialty Hospital' },
  { id: 'sh-enugu-orthopaedic', name: 'National Orthopaedic Hospital, Enugu, Enugu State', address: 'Enugu, Enugu State', website: 'https://www.nohenugu.org.ng/', services: ['Orthopaedics'], acceptsWalkIn: true, category: 'Specialty Hospital' },
  { id: 'sh-lagos-orthopaedic', name: 'National Orthopaedic Hospital, Igbobi, Lagos', address: 'Igbobi, Lagos', website: 'https://nohlagos.gov.ng/', services: ['Orthopaedics'], acceptsWalkIn: true, category: 'Specialty Hospital' },
  { id: 'sh-dadin-kowa-psychiatric', name: 'Federal Neuro-Psychiatric Hospital, Dadin-Kowa, Gombe', address: 'Dadin-Kowa, Gombe', services: ['Psychiatry'], acceptsWalkIn: true, category: 'Specialty Hospital' },
  { id: 'sh-abeokuta-psychiatric', name: 'Federal Neuro-Psychiatric Hospital, Abeokuta, Ogun State', address: 'Abeokuta, Ogun State', website: 'https://portal.neuroaro.gov.ng/', services: ['Psychiatry'], acceptsWalkIn: true, category: 'Specialty Hospital' },
  { id: 'sh-benin-psychiatric', name: 'Federal Neuro-Psychiatric Hospital, Benin', address: 'Benin', website: 'https://new2020.fnphbenin.gov.ng/', services: ['Psychiatry'], acceptsWalkIn: true, category: 'Specialty Hospital' },
  { id: 'sh-calabar-psychiatric', name: 'Federal Neuro-Psychiatric Hospital, Calabar', address: 'Calabar', services: ['Psychiatry'], acceptsWalkIn: true, category: 'Specialty Hospital' },
  { id: 'sh-enugu-psychiatric', name: 'Federal Neuro-Psychiatric Hospital, Enugu', address: 'Enugu', services: ['Psychiatry'], acceptsWalkIn: true, category: 'Specialty Hospital' },
  { id: 'sh-kaduna-psychiatric', name: 'Federal Neuro-Psychiatric Hospital, Kaduna', address: 'Kaduna', services: ['Psychiatry'], acceptsWalkIn: true, category: 'Specialty Hospital' },
  { id: 'sh-kano-psychiatric', name: 'Federal Neuro-Psychiatric Hospital, Kano', address: 'Kano', services: ['Psychiatry'], acceptsWalkIn: true, category: 'Specialty Hospital' },
  { id: 'sh-lagos-psychiatric', name: 'Federal Neuro-Psychiatric Hospital, Lagos', address: 'Lagos', services: ['Psychiatry'], acceptsWalkIn: true, category: 'Specialty Hospital' },
  { id: 'sh-maiduguri-psychiatric', name: 'Federal Neuro-Psychiatric Hospital, Maiduguri', address: 'Maiduguri', services: ['Psychiatry'], acceptsWalkIn: true, category: 'Specialty Hospital' },
  { id: 'sh-sokoto-psychiatric', name: 'Federal Neuro-Psychiatric Hospital, Sokoto', address: 'Sokoto', services: ['Psychiatry'], acceptsWalkIn: true, category: 'Specialty Hospital' },
  { id: 'sh-umuahia-fistula', name: 'National Obstetric Fistula Centre, Umuahia', address: 'Umuahia, Abia State', services: ['Obstetric Fistula Care'], acceptsWalkIn: true, category: 'Specialty Hospital' },
  { id: 'sh-ningi-fistula', name: 'National Obstetric Fistula Centre, Ningi', address: 'Ningi, Bauchi State', services: ['Obstetric Fistula Care'], acceptsWalkIn: true, category: 'Specialty Hospital' },
];

export const teachingHospitals: HealthcareCentre[] = [
  { id: 'th-bauchi', name: 'Abubakar Tafawa Balewa University Teaching Hospital, Bauchi', address: 'Bauchi', website: 'https://atbuth.org.ng/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-zaria', name: 'Ahmadu Bello University Teaching Hospital, Zaria', address: 'Zaria', website: 'https://abuth.gov.ng/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-abuja', name: 'University of Abuja Teaching Hospital, Gwagwalada', address: 'Gwagwalada, Abuja', website: 'https://uath.gov.ng/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-calabar', name: 'University of Calabar Teaching Hospital, Calabar', address: 'Calabar', website: 'https://ucthcalabar.gov.ng/public/about', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-enugu', name: 'University of Nigeria Teaching Hospital, Ituku-Ozalla, Enugu', address: 'Enugu', website: 'https://unth.edu.ng/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-ibadan', name: 'University College Hospital, Ibadan', address: 'Ibadan', website: 'https://uch-ibadan.org.ng/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-ile-ife', name: 'Obafemi Awolowo University Teaching Hospitals Complex, Ile-Ife', address: 'Ile-Ife', website: 'https://oauife.edu.ng/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-ilorin', name: 'University of Ilorin Teaching Hospital, Ilorin', address: 'Ilorin', website: 'https://www.uithilorin.org.ng/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-jos', name: 'Jos University Teaching Hospital, Jos', address: 'Jos', website: 'https://juth.gov.ng/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-kano', name: 'Aminu Kano Teaching Hospital, Kano', address: 'Kano', website: 'https://akth.gov.ng/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-maiduguri', name: 'University of Maiduguri Teaching Hospital, Maiduguri', address: 'Maiduguri', website: 'https://www.umth.gov.ng/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-sokoto', name: 'Usmanu Danfodiyo University Teaching Hospital, Sokoto', address: 'Sokoto', website: 'https://uduth.org.ng/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-nnewi', name: 'Nnamdi Azikiwe University Teaching Hospital, Nnewi', address: 'Nnewi', website: 'https://www.nauthnnewi.org.ng/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-benin', name: 'University of Benin Teaching Hospital, Benin', address: 'Benin', website: 'https://ubth.org/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-port-harcourt', name: 'University of Port Harcourt Teaching Hospital, Port Harcourt', address: 'Port Harcourt', website: 'https://upthng.com/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-irrua', name: 'Irrua Specialist Teaching Hospital, Irrua', address: 'Irrua', website: 'https://www.isth.org.ng/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-lagos', name: 'Lagos University Teaching Hospital, Idi-Araba', address: 'Idi-Araba, Lagos', website: 'https://luth.gov.ng/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-abakaliki', name: 'Alex Ekwueme Federal University Teaching Hospital, Abakaliki', address: 'Abakaliki', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-akure', name: 'Federal Medical Centre, Owo (Upgraded to Teaching Hospital)', address: 'Owo, Ondo State', website: 'https://www.fmcowo.org.ng/', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-asaba', name: 'Federal Medical Centre, Asaba (Upgraded to Teaching Hospital)', address: 'Asaba, Delta State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-yenagoa', name: 'Federal Medical Centre, Yenagoa (Upgraded to Teaching Hospital)', address: 'Yenagoa, Bayelsa State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-lafia', name: 'Federal University of Lafia Teaching Hospital', address: 'Lafia, Nasarawa State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-gusau', name: 'Federal Medical Centre, Gusau (Upgraded to Teaching Hospital)', address: 'Gusau, Zamfara State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-dutse', name: 'Federal University Dutse Teaching Hospital', address: 'Dutse, Jigawa State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-birnin-kebbi', name: 'Federal Medical Centre, Birnin Kebbi (Upgraded to Teaching Hospital)', address: 'Birnin Kebbi, Kebbi State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-owerri', name: 'Federal Medical Centre, Owerri (Upgraded to Teaching Hospital)', address: 'Owerri, Imo State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-gashua', name: 'Federal University Gashua Teaching Hospital', address: 'Gashua, Yobe State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-gombe', name: 'Federal Teaching Hospital, Gombe', address: 'Gombe', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-ekiti', name: 'Federal Teaching Hospital, Ido-Ekiti', address: 'Ido-Ekiti', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-katsina', name: 'Federal Teaching Hospital, Katsina', address: 'Katsina', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-lokoja', name: 'Federal Teaching Hospital, Lokoja', address: 'Lokoja, Kogi State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' },
  { id: 'th-umuahia', name: 'Federal Medical Centre, Umuahia (Upgraded to Teaching Hospital)', address: 'Umuahia, Abia State', services: ['General Medicine', 'Specialist Care'], acceptsWalkIn: true, category: 'Teaching Hospital' }
];

export const nhiaPractitioners: HealthcareCentre[] = nhiaPractitionersRaw.map((entry: any) => ({
  id: `nhia-${entry.value.sno}`,
  name: entry.value.healthcareprovidername,
  address: entry.value.address,
  services: [],
  acceptsWalkIn: false,
  walkInPolicy: 'accepted and by appointment, book appointment',
  category: 'NHIA Practitioner',
  facilityType: entry.value.facilitytype,
  code: entry.value.healthcareprovidercode,
}));

export const allHealthcareCentres: HealthcareCentre[] = [
  ...federalMedicalCentres,
  ...specialtyHospitals,
  ...teachingHospitals,
  ...nhiaPractitioners,
];
