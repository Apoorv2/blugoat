import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// You'd replace this with your actual database code
async function saveToDatabase(data: any) {
  // Example implementation - replace with your database logic
  // console.log('Saving to database:', data);
  // await db.userPreferences.create({ data });
  return { success: true };
}

export async function POST(req: Request) {
  // Verify the user is authenticated
  const { userId } = auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();

    // Validate that this is the same user
    if (data.userId !== userId) {
      return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
    }

    // Save to your database
    await saveToDatabase({
      userId,
      city: data.city,
      state: data.state,
      industry: data.industry,
      occupations: data.selectedOccupations,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save preferences' },
      { status: 500 },
    );
  }
}
