import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { buttonVariants } from '@/components/ui/buttonVariants';
import { CTABanner } from '@/features/landing/CTABanner';
import { Section } from '@/features/landing/Section';

export const CTA = () => {
  const t = useTranslations('CTA');

  return (
    <Section>
      <CTABanner
        title={t('title')}
        description={t('description')}
        buttons={(
          <a
            className={buttonVariants({ variant: 'outline', size: 'lg' })}
            href="/sign-up"
          >
            <Image
              src="/blugoatLogo.png"
              alt="BluGoat Logo"
              width={64}
              height={64}
              className=""
            />
            {t('button_text')}
          </a>
        )}
      />
    </Section>
  );
};
