'use client';

import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { CreditCard, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample transaction data - in a real app, this would come from your API
const SAMPLE_CREDIT_PURCHASES = [
  { id: 'txn-001', date: '2023-05-15', amount: 100, credits: 100, status: 'completed', price: 999 },
  { id: 'txn-002', date: '2023-06-22', amount: 300, credits: 300, status: 'completed', price: 2499 },
  { id: 'txn-003', date: '2023-08-10', amount: 500, credits: 500, status: 'completed', price: 3999 },
];

const SAMPLE_LEAD_PURCHASES = [
  { id: 'lead-001', date: '2023-05-16', leads: 5, credits: 25, status: 'completed' },
  { id: 'lead-002', date: '2023-06-23', leads: 10, credits: 50, status: 'completed' },
  { id: 'lead-003', date: '2023-07-05', leads: 20, credits: 100, status: 'completed' },
  { id: 'lead-004', date: '2023-08-12', leads: 15, credits: 75, status: 'completed' },
];

export const PurchaseHistory = () => {
  const { user } = useUser();
  const t = useTranslations('PurchaseHistory');
  const [activeTab, setActiveTab] = useState('credits');

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  // Status badge color mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <Card className="overflow-hidden border-none shadow-md">
      <Tabs defaultValue="credits" className="w-full" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-2xl font-semibold text-gray-800">Transaction History</h2>
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="credits" className="flex items-center gap-2">
              <CreditCard className="size-4" />
              Credit Top-Ups
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Search className="size-4" />
              Lead Purchases
            </TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="p-0">
          <TabsContent value="credits" className="m-0 border-0 p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-6 py-4">
                <p className="text-muted-foreground">Record of all credit purchases and top-ups for your account</p>
              </div>
              <div className="rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="w-[180px] font-semibold">Transaction ID</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Credits</TableHead>
                      <TableHead className="font-semibold">Amount</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SAMPLE_CREDIT_PURCHASES.map(transaction => (
                      <TableRow key={transaction.id} className="hover:bg-blue-50">
                        <TableCell className="font-medium text-blue-700">{transaction.id}</TableCell>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell className="font-medium text-green-600">
                          +
                          {transaction.credits}
                        </TableCell>
                        <TableCell>
                          ₹
                          {transaction.price}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transaction.status)} variant="outline">
                            {transaction.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          </TabsContent>

          <TabsContent value="leads" className="m-0 border-0 p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-6 py-4">
                <p className="text-muted-foreground">Record of all leads purchased and credits consumed</p>
              </div>
              <div className="rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="w-[180px] font-semibold">Transaction ID</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Leads</TableHead>
                      <TableHead className="font-semibold">Credits Used</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {SAMPLE_LEAD_PURCHASES.map(transaction => (
                      <TableRow key={transaction.id} className="hover:bg-blue-50">
                        <TableCell className="font-medium text-blue-700">{transaction.id}</TableCell>
                        <TableCell>{formatDate(transaction.date)}</TableCell>
                        <TableCell>{transaction.leads}</TableCell>
                        <TableCell className="font-medium text-orange-600">
                          -
                          {transaction.credits}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transaction.status)} variant="outline">
                            {transaction.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </motion.div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
};
