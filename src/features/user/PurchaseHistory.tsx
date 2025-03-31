/* eslint-disable style/multiline-ternary */
'use client';

import { useAuth } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { ArrowDownIcon, ArrowUpIcon, CreditCard, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define transaction types based on the API response
type Transaction = {
  id: string;
  wallet_id: string;
  transaction_type: string;
  amount: number;
  balance_after: number;
  description: string;
  reference_type: string;
  reference_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
};

type TransactionResponse = {
  success: boolean;
  data: {
    transactions: Transaction[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
    summary: Array<{
      transaction_type: string;
      count: string;
      total_amount: string;
    }>;
  };
};

export const PurchaseHistory = () => {
  const { getToken } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();
        const response = await fetch(
          `https://blugoat-api-310650732642.us-central1.run.app/api/auth/credits/transactions?page=${currentPage}&limit=10&sortBy=created_at&sortDirection=DESC`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }

        const data: TransactionResponse = await response.json();
        setTransactions(data.data.transactions);
        setPagination(data.data.pagination);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [getToken, currentPage]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Get human readable transaction type
  const getTransactionTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      signup_bonus: 'Sign-up Bonus',
      credit_purchase: 'Credit Purchase',
      lead_purchase: 'Lead Purchase',
      refund: 'Refund',
      promotional: 'Promotional Credit',
    };

    return typeMap[type] || type.replace(/_/g, ' ');
  };

  // Filter transactions based on active tab
  const filteredTransactions = transactions.filter((transaction) => {
    if (activeTab === 'all') {
      return true;
    }
    if (activeTab === 'credits') {
      return transaction.amount > 0;
    }
    if (activeTab === 'leads') {
      return transaction.amount < 0;
    }
    return true;
  });

  return (
    <Card className="overflow-hidden border-none shadow-md">
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-2xl font-semibold text-gray-800">Transaction History</h2>
          <TabsList className="grid w-[400px] grid-cols-3">
            <TabsTrigger value="all">
              All Transactions
            </TabsTrigger>
            <TabsTrigger value="credits" className="flex items-center gap-2">
              <CreditCard className="size-4" />
              Credits Added
            </TabsTrigger>
            <TabsTrigger value="leads" className="flex items-center gap-2">
              <Search className="size-4" />
              Credits Used
            </TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="p-0">
          <TabsContent value={activeTab} className="m-0 border-0 p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-6 py-4">
                <p className="text-muted-foreground">
                  {activeTab === 'credits' && 'Record of all credit purchases and top-ups for your account'}
                  {activeTab === 'leads' && 'Record of all leads purchased and credits consumed'}
                  {activeTab === 'all' && 'Complete record of all transactions in your account'}
                </p>
              </div>
              {isLoading ? (
                <div className="space-y-4 p-6">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <>
                  <div className="rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 hover:bg-gray-50">
                          <TableHead className="font-semibold">Date & Time</TableHead>
                          <TableHead className="font-semibold">Transaction Type</TableHead>
                          <TableHead className="font-semibold">Description</TableHead>
                          <TableHead className="font-semibold">Credits</TableHead>
                          <TableHead className="font-semibold">Balance</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransactions.length > 0
                          ? (
                              filteredTransactions.map(transaction => (
                                <TableRow key={transaction.id} className="hover:bg-blue-50">
                                  <TableCell>{formatDate(transaction.created_at)}</TableCell>
                                  <TableCell>
                                    <Badge className="bg-blue-100 text-blue-800" variant="outline">
                                      {getTransactionTypeLabel(transaction.transaction_type)}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{transaction.description}</TableCell>
                                  <TableCell className={transaction.amount > 0 ? 'font-medium text-green-600' : 'font-medium text-orange-600'}>
                                    {transaction.amount > 0
                                      ? (
                                          <span className="flex items-center">
                                            <ArrowUpIcon className="mr-1 size-3" />
                                            +
                                            {transaction.amount}
                                          </span>
                                        )
                                      : (
                                          <span className="flex items-center">
                                            <ArrowDownIcon className="mr-1 size-3" />
                                            {transaction.amount}
                                          </span>
                                        )}
                                  </TableCell>
                                  <TableCell className="font-medium">{transaction.balance_after}</TableCell>
                                </TableRow>
                              ))
                            )
                          : (
                              <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                  No transactions found.
                                </TableCell>
                              </TableRow>
                            )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {pagination.pages > 1 && (
                    <div className="flex items-center justify-between border-t px-6 py-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <span className="text-sm text-gray-600">
                        Page
                        {' '}
                        {currentPage}
                        {' '}
                        of
                        {' '}
                        {pagination.pages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                        disabled={currentPage === pagination.pages}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
};
