'use client';

import { usePathname } from 'next/navigation';

export default function CatchAllPage() {
  const pathname = usePathname();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Page Not Found</h1>
      <p className="mt-4">
        The requested path
        {pathname}
        {' '}
        could not be found.
      </p>
      <div className="mt-8">
        <a href="/en/dashboard" className="text-blue-600 hover:underline">
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}
