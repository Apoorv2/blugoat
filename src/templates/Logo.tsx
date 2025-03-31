import Image from 'next/image';

import { AppConfig } from '@/utils/AppConfig';

export const Logo = (props: {
  isTextHidden?: boolean;
}) => (
  <div className="flex items-center text-xl font-semibold">
    <Image
      src="/blugoatLogo.jpeg"
      alt="BluGoat Logo"
      width={64}
      height={64}
      className="mr-1"
    />
    {!props.isTextHidden && AppConfig.name}
  </div>
);
