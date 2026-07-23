import { NextResponse } from 'next/server';
import { getAllDocs } from '@/lib/docs';

export async function GET() {
  const docs = getAllDocs();
  
  // We only send the metadata to the client to keep the payload small
  const searchIndex = docs.map(doc => ({
    slug: doc.meta.slug,
    title: doc.meta.title,
    description: doc.meta.description || '',
    category: doc.meta.category,
    tags: doc.meta.tags || [],
  }));

  return NextResponse.json(searchIndex);
}
