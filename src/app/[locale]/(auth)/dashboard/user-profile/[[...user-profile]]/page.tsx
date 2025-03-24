'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TitleBar } from '@/features/dashboard/TitleBar';
import { PurchaseHistory } from '@/features/user/PurchaseHistory';
import { UserProfileDetails } from '@/features/user/UserProfileDetails';

const UserProfilePage = (_props: { params: { locale: string } }) => {
  const t = useTranslations('UserProfile');
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <>
      <TitleBar
        title="User Profile"
        description="Manage your account settings and view purchase history"
      />

      <Tabs defaultValue="profile" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="purchases">Purchase History</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-0">
          <UserProfileDetails />
        </TabsContent>

        <TabsContent value="purchases" className="mt-0">
          <PurchaseHistory />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default UserProfilePage;
