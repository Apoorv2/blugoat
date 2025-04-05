import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { queryPrompt, quantity, email: userEmail, phoneNumber, userId } = data;

    // Validate required fields
    if (!queryPrompt || !quantity || !userEmail) {
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
          email_id: userEmail,
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

    // Send notification to admin emails
    await sendAdminNotification({
      queryPrompt,
      quantity,
      userEmail,
      userId,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      transactionId: insertData?.[0]?.id,
      message: 'Query saved successfully',
    });
  } catch (error) {
    console.error('Error processing query:', error);
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 },
    );
  }
}

async function sendAdminNotification(queryData: {
  queryPrompt: string;
  quantity: string;
  userEmail: string;
  userId: string;
  timestamp: string;
}) {
  // Replace hardcoded emails with environment variable
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAIL_RECIPIENTS?.split(',') || ['blugoat2025@gmail.com'];

  // Configure email transport
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Format the notification email
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: adminEmails.join(','),
    subject: 'A user has requested for audience query',
    html: `
      <h2>New Audience Query Request</h2>
      <p><strong>A user has requested for audience query</strong></p>
      <p><strong>Query:</strong> ${queryData.queryPrompt}</p>
      <p><strong>Quantity:</strong> ${queryData.quantity} contacts</p>
      <p><strong>User Email:</strong> ${queryData.userEmail}</p>
      <p><strong>User ID:</strong> ${queryData.userId}</p>
      <p><strong>Time:</strong> ${new Date(queryData.timestamp).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'long',
        timeStyle: 'long',
      })}</p>
    `,
  };

  // Send the email
  await transporter.sendMail(mailOptions);
}
