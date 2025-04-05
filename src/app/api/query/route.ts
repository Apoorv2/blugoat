import { NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // Get request data
    const data = await request.json();
    const { queryPrompt, quantity, email, phoneNumber, userId } = data;

    // Validate required fields
    if (!queryPrompt || !quantity || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Insert into Supabase
    const { data: insertData, error } = await supabase
      .from('user_query_transactions')
      .insert([
        {
          clerk_user_id: userId || 'anonymous',
          email_id: email,
          query_prompt: queryPrompt,
          quantity: Number.parseInt(quantity, 10),
          phone_number: phoneNumber || null,
          stage: 'queried',
        },
      ])
      .select();

    if (error) {
      console.error('Error inserting query:', error);
      return NextResponse.json(
        { error: 'Failed to save query' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      transactionId: insertData?.[0]?.id,
      message: 'Query saved successfully',
    });
  } catch (error) {
    console.error('Error processing query:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
