// @ts-nocheck

'use client';

import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Camera, Mail, Phone, User } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

// Fallback data in case user data isn't loaded
const FALLBACK_DATA = {
  name: 'Rahul Sharma',
  email: 'rahul.sharma@example.com',
  phone: '+91 98765 43210',
  credits: 250,
  leadsPurchased: 45,
  joinDate: '2023-01-15',
  organization: 'Sharma Technologies',
  role: 'Admin',
  address: {
    street: '123 Business Park',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    country: 'India',
  },
};

export const UserProfileDetails = () => {
  const { user, isLoaded } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(FALLBACK_DATA);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Update user data when Clerk data is loaded
  useEffect(() => {
    if (isLoaded && user) {
      const clerkUserData = {
        name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.primaryEmailAddress?.emailAddress || '',
        phone: user.phoneNumbers?.[0]?.phoneNumber || '',
        credits: userData.credits,
        leadsPurchased: userData.leadsPurchased,
        joinDate: typeof user.createdAt === 'string'
          ? user.createdAt
          : user.createdAt?.toISOString() || userData.joinDate,
        organization: user.organizationMemberships?.[0]?.organization.name || userData.organization,
        role: user.organizationMemberships?.[0]?.role || userData.role,
        address: userData.address,
      };

      setUserData(clerkUserData);
      setFormData({
        name: clerkUserData.name,
        email: clerkUserData.email,
        phone: clerkUserData.phone,
      });
    }
  }, [isLoaded, user]);

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    if (!user) {
      return;
    }

    try {
      // In a real app, you'd make API calls to update user data
      // For now, we'll just update the local state
      setUserData(prev => ({
        ...prev,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      }));

      // You would call Clerk API here to update profile
      // await user.update({
      //   firstName: formData.name.split(' ')[0],
      //   lastName: formData.name.split(' ').slice(1).join(' '),
      // });

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <Card className="overflow-hidden border-none shadow-md">
      <CardContent className="p-0">
        {/* User Header */}
        <div className="relative h-40 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="absolute -bottom-16 left-8">
            <Avatar className="size-32 border-4 border-white bg-white shadow-md">
              <AvatarImage src={user?.imageUrl || ''} alt={userData.name} />
              <AvatarFallback className="text-3xl">{getInitials(userData.name)}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Profile Content */}
        <div className="mt-20 px-8 pb-8">
          <div className="flex justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{userData.name}</h2>
              <p className="text-muted-foreground">
                {userData.organization}
                {' '}
                •
                {' '}
                {userData.role}
              </p>
            </div>
            <Button
              variant={isEditing ? 'outline' : 'default'}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* User Information Section */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="font-semibold text-gray-800">Account Information</h3>

              {isEditing
                ? (
                    <div className="space-y-4 rounded-md border p-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="flex gap-2">
                          <User className="size-5 text-gray-500" />
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <div className="flex gap-2">
                          <Mail className="size-5 text-gray-500" />
                          <Input
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="flex gap-2">
                          <Phone className="size-5 text-gray-500" />
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <Button className="mt-2 w-full" onClick={handleSaveChanges}>Save Changes</Button>
                    </div>
                  )
                : (
                    <div className="space-y-2 rounded-md border p-4">
                      <div className="flex items-center gap-2">
                        <Mail className="size-5 text-gray-500" />
                        <span>{userData.email}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Phone className="size-5 text-gray-500" />
                        <span>{userData.phone}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Member since:</span>
                        <span>{formatDate(userData.joinDate)}</span>
                      </div>
                    </div>
                  )}
            </motion.div>

            {/* Account Statistics */}
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <h3 className="font-semibold text-gray-800">Account Statistics</h3>

              <div className="space-y-4 rounded-md border p-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Available Credits</span>
                  <span className="font-bold text-green-600">{userData.credits}</span>
                </div>
                <Separator />

                <div className="flex justify-between">
                  <span className="text-gray-500">Total Leads Purchased</span>
                  <span className="font-semibold">{userData.leadsPurchased}</span>
                </div>
                <Separator />

                <div>
                  <h4 className="mb-2 font-medium text-gray-700">Billing Address</h4>
                  <p className="text-sm text-gray-500">
                    {userData.address.street}
                    <br />
                    {userData.address.city}
                    ,
                    {userData.address.state}
                    {' '}
                    {userData.address.pincode}
                    <br />
                    {userData.address.country}
                  </p>
                </div>
              </div>

              <Button variant="outline" className="mt-2 w-full">
                <Camera className="mr-2 size-4" />
                Update Profile Picture
              </Button>
            </motion.div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
