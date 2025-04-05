/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable no-alert */
'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Import the DashboardHeader component
// Since we've defined it at the top level in lead-query page,
// we should ideally move it to a separate component file for reuse
import { DashboardHeader } from '@/components/dashboard-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function SupportPage({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get user information from Clerk
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { user } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Reset form
    setMessage('');
    setIsSubmitting(false);

    // Show success message or redirect
    alert('Your message has been sent. We will contact you shortly.');
  };

  return (
    <>
      <DashboardHeader locale={locale} user={user} signOut={signOut} router={router} />
      <div className="container mx-auto flex min-h-[calc(100vh-64px)] flex-col p-4">
        <div className="mx-auto w-full max-w-3xl">
          <h1 className="mb-6 text-center text-3xl font-bold">Support</h1>

          <div className="mb-8 grid gap-6 md:grid-cols-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="mr-2 size-5" />
                  Email Support
                </CardTitle>
                <CardDescription>
                  Send us an email for any queries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium">
                  <a href="mailto:blugoat2025@gmail.com" className="text-blue-600 hover:underline">
                    blugoat2025@gmail.com
                  </a>
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  We usually respond within 24 hours
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>
                We'll get back to you as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="message" className="mb-1 block text-sm font-medium">
                      Your Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="How can we help you?"
                      className="min-h-[150px]"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? (
                          <>
                            <span className="mr-2 size-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                            Sending...
                          </>
                        )
                      : (
                          'Send Message'
                        )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center text-gray-600">
            {/* <p className="mb-2">
              For fastest support, please include your account information and order details when contacting us.
            </p> */}
            <p>
              Our support team is available to help you with any questions about your audience queries, data delivery,
              or account management.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
