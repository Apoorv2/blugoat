/* eslint-disable unused-imports/no-unused-vars */

'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Database, Info, Mail, Search, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function LeadQueryPage({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [queryText, setQueryText] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showQueryForm, setShowQueryForm] = useState(true);
  const [quantity, setQuantity] = useState('');

  // Example queries for users to select
  const exampleQueries = [
    'High net worth individuals in Mumbai',
    'Software engineers in Bangalore with salary above 20LPA',
    'Real estate agents in Delhi with over 5 years experience',
  ];

  // Audience quantity options with associated cost ranges
  const quantityOptions = [
    { value: '5000', label: '5,000 contacts', minCost: 10000, maxCost: 25000 },
    { value: '10000', label: '10,000 contacts', minCost: 20000, maxCost: 50000 },
    { value: '20000', label: '20,000 contacts', minCost: 40000, maxCost: 100000 },
  ];

  // Calculate the current cost range based on selected quantity
  const selectedOption = quantityOptions.find(option => option.value === quantity);
  const costRange = selectedOption
    ? {
        min: selectedOption.minCost,
        max: selectedOption.maxCost,
      }
    : { min: 0, max: 0 };

  const handleExampleClick = (example: string) => {
    setQueryText(example);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim() || !quantity) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Store the query and quantity in localStorage
      localStorage.setItem('last_query', queryText);
      localStorage.setItem('audience_quantity', quantity);

      // Hide the form and show the success animation
      setShowQueryForm(false);
      setShowSuccess(true);
    } catch (error) {
      console.error('Error submitting query:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If we've successfully submitted, show the success animation
  if (showSuccess) {
    return (
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
        <div className="flex max-w-2xl flex-col items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-4 text-center"
          >
            <Image
              src="/blugoatLogo.png"
              alt="Bluegoat Logo"
              width={120}
              height={40}
              className="mx-auto mb-4"
            />

            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Your Request is Being Processed
            </h1>
            <p className="mx-auto mb-4 max-w-xl text-base text-gray-600">
              Our AI is searching for your perfect audience of
              {' '}
              {Number.parseInt(quantity).toLocaleString()}
              {' '}
              contacts based on your criteria.
              We'll email your tailored results within 2-4 hours.
            </p>
          </motion.div>

          <div className="relative mb-6 flex size-48 items-center justify-center">
            {/* Pulsing background circles */}
            <motion.div
              className="absolute rounded-full bg-blue-100"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ width: '100%', height: '100%' }}
            />

            <motion.div
              className="absolute rounded-full bg-blue-200"
              animate={{
                scale: [1.1, 1.3, 1.1],
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.5,
              }}
              style={{ width: '85%', height: '85%' }}
            />

            <motion.div
              className="absolute rounded-full bg-blue-300"
              animate={{
                scale: [1.2, 1.4, 1.2],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
              style={{ width: '65%', height: '65%' }}
            />

            {/* Center icon that rotates */}
            <motion.div
              className="relative z-10 flex size-20 items-center justify-center rounded-full bg-white shadow-lg"
              animate={{ rotate: 360 }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <Search className="size-10 text-blue-500" />
            </motion.div>

            {/* Orbiting elements */}
            <motion.div
              className="absolute"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <motion.div
                className="relative -left-32 flex size-12 items-center justify-center rounded-full bg-white shadow-md"
              >
                <Database className="size-6 text-blue-400" />
              </motion.div>
            </motion.div>

            <motion.div
              className="absolute"
              animate={{
                rotate: -360,
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: 'linear',
                delay: 1,
              }}
            >
              <motion.div
                className="relative -top-28 flex size-12 items-center justify-center rounded-full bg-white shadow-md"
              >
                <Mail className="size-6 text-green-500" />
              </motion.div>
            </motion.div>

            <motion.div
              className="absolute"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: 'linear',
                delay: 2,
              }}
            >
              <motion.div
                className="relative right-24 top-24 flex size-12 items-center justify-center rounded-full bg-white shadow-md"
              >
                <CheckCircle className="size-6 text-green-500" />
              </motion.div>
            </motion.div>
          </div>

          <div className="w-full text-center">
            <motion.div
              className="mx-auto mb-3 h-2 w-48 overflow-hidden rounded-full bg-gray-200"
            >
              <motion.div
                className="h-full bg-blue-500"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{
                  duration: 8,
                  ease: 'easeInOut',
                  repeat: Infinity,
                }}
              />
            </motion.div>

            <p className="mb-4 text-xs text-gray-500">
              Our AI is analyzing data points across multiple sources to find your perfect audience match
            </p>

            <Button
              onClick={() => {
                setShowSuccess(false);
                setShowQueryForm(true);
                setQueryText('');
              }}
              variant="outline"
              size="sm"
            >
              Start a New Query
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise show the query form
  return (
    <div className="container mx-auto flex min-h-screen flex-col p-4">
      <div className="mb-8 flex flex-col items-center justify-center">
        <div className="mb-4 flex justify-center">
          <Image
            src="/blugoatLogo.png"
            alt="Bluegoat Logo"
            width={120}
            height={40}
            className="mb-2"
          />
        </div>
        <h1 className="text-center text-2xl font-bold text-gray-900 md:text-3xl">
          Find Your Perfect Audience
        </h1>
        <p className="mt-2 max-w-2xl text-center text-gray-600">
          Describe the audience you're looking for and our AI will find the right people for your campaign
        </p>

        {/* New info alert about query limits */}
        <Alert className="mt-4 max-w-2xl border-blue-100 bg-blue-50">
          <Info className="size-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-800">
            <span className="font-medium">Daily Query Limit:</span>
            {' '}
            You have 3 audience queries available per day.
            Once processed, a sample of 50 your matched data will be sent to your registered email within 2-4 hours.
            You can purchase the full dataset if the sample meets your requirements.
          </AlertDescription>
        </Alert>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Sparkles className="size-5 text-blue-500" />
              <CardTitle>Audience Query</CardTitle>
            </div>
            <CardDescription>
              Be specific about location, industry, job titles or other criteria
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="query" className="mb-2 block font-medium">
                    Describe your target audience
                  </label>
                  <Textarea
                    id="query"
                    placeholder="Example: Financial advisors in Mumbai with 5+ years experience"
                    className="min-h-[120px]"
                    value={queryText}
                    onChange={e => setQueryText(e.target.value)}
                    required
                  />
                </div>

                {/* Dropdown for audience quantity selection */}
                <div>
                  <Label htmlFor="quantity" className="mb-2 block font-medium">
                    How many contacts do you need?
                  </Label>
                  <Select
                    value={quantity}
                    onValueChange={setQuantity}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select the number of contacts" />
                    </SelectTrigger>
                    <SelectContent>
                      {quantityOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex w-full items-center justify-between">
                            <span>{option.label}</span>
                            <span className="ml-4 font-medium text-blue-700">
                              ₹
                              {option.minCost.toLocaleString()}
                              {' '}
                              - ₹
                              {option.maxCost.toLocaleString()}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="mt-2 text-sm text-gray-500">
                    Pricing: ₹2-5 per contact depending on complexity and specificity.
                  </p>
                </div>

                <div>
                  <p className="mb-2 font-medium">Try one of these examples:</p>
                  <div className="flex flex-wrap gap-2">
                    {exampleQueries.map((example, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleExampleClick(example)}
                        className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-700 hover:bg-blue-100"
                      >
                        {example}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </form>
          </CardContent>

          <CardFooter className="flex justify-between border-t bg-gray-50 px-6 py-4">
            {/* Only show estimated cost if a quantity is selected */}
            {quantity
              ? (
                  <div className="text-sm font-medium text-gray-700">
                    Estimated cost: ₹
                    {costRange.min.toLocaleString()}
                    {' '}
                    - ₹
                    {costRange.max.toLocaleString()}
                  </div>
                )
              : (
                  <div className="text-sm text-gray-500">
                    Select a quantity to see estimated cost
                  </div>
                )}

            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || !queryText.trim() || !quantity}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isSubmitting
                ? (
                    <>
                      <span className="mr-2 size-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      Processing...
                    </>
                  )
                : (
                    <>
                      Find Audience
                      <ArrowRight className="ml-2 size-4" />
                    </>
                  )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
