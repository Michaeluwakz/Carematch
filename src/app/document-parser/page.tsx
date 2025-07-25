import { DocumentParserForm } from '@/components/document-parser/document-parser-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Smart Document Parser - CareMatch AI',
  description: 'Upload your health documents and let our AI extract and explain the important information in simple terms.',
};

export default function DocumentParserPage() {
  return (
    <div className="w-full">
      <DocumentParserForm />
    </div>
  );
}
