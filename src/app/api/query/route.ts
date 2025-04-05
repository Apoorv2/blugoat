import { auth } from '@clerk/nextjs/server';
import emailjs from '@emailjs/browser';
import { NextResponse } from 'next/server';

import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // Get authenticated user
    const { userId } = auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get request data
    const data = await request.json();
    const { queryPrompt, quantity, email, phoneNumber } = data;

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
          clerk_user_id: userId,
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

    // Send notification email to admin(s)
    try {
      // Get admin email recipients from env
      const adminEmails = process.env.ADMIN_EMAIL_RECIPIENTS?.split(',') || [];

      if (adminEmails.length > 0) {
        // Send email notification
        await emailjs.send(
          process.env.EMAILJS_SERVICE_ID || '',
          process.env.EMAILJS_TEMPLATE_ID || '',
          {
            to_email: adminEmails.join(','),
            user_email: email,
            query_text: queryPrompt,
            quantity,
            transaction_id: insertData?.[0]?.id,
          },
          process.env.EMAILJS_PUBLIC_KEY,
        );
      }
    } catch (emailError) {
      // Log but don't fail the request if email sending fails
      console.error('Error sending notification email:', emailError);
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
