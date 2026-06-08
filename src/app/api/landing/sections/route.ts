import { NextResponse } from 'next/server';
import { adminFetchLandingSections, adminUpdateLandingSection } from '@/lib/landing-page-db';

export async function GET() {
  try {
    const sections = await adminFetchLandingSections();
    return NextResponse.json(sections);
  } catch (error) {
    console.error('Error fetching landing sections:', error);
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const sections = body.sections as {
      id: string;
      title?: string;
      subtitle?: string | null;
      isVisible?: boolean;
      config?: unknown;
    }[];

    if (!Array.isArray(sections)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    await Promise.all(
      sections.map((section) =>
        adminUpdateLandingSection(section.id, {
          ...(section.title !== undefined && { title: section.title }),
          ...(section.subtitle !== undefined && { subtitle: section.subtitle }),
          ...(section.isVisible !== undefined && { isVisible: section.isVisible }),
          ...(section.config !== undefined && { config: section.config }),
        })
      )
    );

    const updated = await adminFetchLandingSections();
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating landing sections:', error);
    return NextResponse.json({ error: 'Failed to update sections' }, { status: 500 });
  }
}
