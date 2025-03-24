import Image from 'next/image';

import { LogoCloud } from '@/features/landing/LogoCloud';

export const SponsorLogos = () => (
  <LogoCloud text="Trusted by">
    <Image
      src="/assets/images/salesforce.png"
      alt="salesforce logo dark"
      className="dark:hidden"
      width="128"
      height="37"
    />
    <Image
      src="/assets/images/salesforce.png"
      alt="salesforce logo light"
      className="hidden dark:block"
      width="128"
      height="37"
    />

    <Image
      src="/assets/images/hubspot.png"
      alt="hubspot logo dark"
      className="dark:hidden"
      width="128"
      height="26"
    />
    <Image
      src="/assets/images/hubspot.png"
      alt="hubspot logo light"
      className="hidden dark:block"
      width="128"
      height="26"
    />

    <Image
      src="/assets/images/zoho.png"
      alt="Zoho logo dark"
      className="dark:hidden"
      width="128"
      height="38"
    />
    <Image
      src="/assets/images/zoho.png"
      alt="Zoho logo light"
      className="hidden dark:block"
      width="128"
      height="38"
    />

    <Image
      src="/assets/images/DropBox.png"
      alt="DropBox logo dark"
      className="dark:hidden"
      width="128"
      height="38"
    />
    <Image
      src="/assets/images/DropBox.png"
      alt="DropBox logo light"
      className="hidden dark:block"
      width="128"
      height="38"
    />
    <Image
      src="/assets/images/DataBricks.png"
      alt="DataBricks logo dark"
      className="dark:hidden"
      width="128"
      height="38"
    />
    <Image
      src="/assets/images/DataBricks.png"
      alt="DataBricks logo light"
      className="hidden dark:block"
      width="128"
      height="38"
    />
  </LogoCloud>
);
