/* eslint-disable react/no-useless-fragment */
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

import { CenteredFooter } from '@/features/landing/CenteredFooter';
import { Section } from '@/features/landing/Section';
import { AppConfig } from '@/utils/AppConfig';

import { Logo } from './Logo';

export const Footer = () => {
  const t = useTranslations('Footer');

  return (
    <Section className="pb-16 pt-0">
      <CenteredFooter
        logo={<Logo />}
        name={AppConfig.name}
        iconList={(
          <>
            {/* X.com (Twitter) icon */}
            <li>
              <Link
                href="https://x.com/blugoat2025"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/assets/images/xlogo.webp"
                  alt="X.com"
                  width={36}
                  height={36}
                  className="opacity-60 hover:opacity-100"
                />
              </Link>
            </li>

            {/* Instagram icon */}
            <li>
              <Link
                href="https://www.instagram.com/blugoat?igsh=eWR1Ym44MTVubzd2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/assets/images/instalogo.png"
                  alt="Instagram"
                  width={36}
                  height={36}
                  className="opacity-60 hover:opacity-100"
                />
              </Link>
            </li>
          </>
        )}
        legalLinks={(
          <>
            <li>
              <Link href="/sign-up">{t('terms_of_service')}</Link>
            </li>
            <li>
              <Link href="/sign-up">{t('privacy_policy')}</Link>
            </li>
          </>
        )}
      >
        <></>
      </CenteredFooter>
    </Section>
  );
};
