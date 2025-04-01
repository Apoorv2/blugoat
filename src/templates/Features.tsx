/* eslint-disable style/indent */
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { Background } from '@/components/Background';
import { FeatureCard } from '@/features/landing/FeatureCard';
import { Section } from '@/features/landing/Section';

export const Features = () => {
  const t = useTranslations('Features');

  return (
    <Background>
      <Section
        subtitle={t('section_subtitle')}
        title={t('section_title')}
        description={t('section_description')}
      >
        {/* <div className="mb-12 flex justify-center">
          <div className="text-center">
            <p className="mt-4 text-lg font-medium text-primary">Powered by Advanced AI</p>
          </div>
        </div> */}

        <div className="grid grid-cols-1 gap-x-3 gap-y-8 md:grid-cols-3">
          <FeatureCard
            icon={(
              <div className="flex items-center justify-center">
              <Image
                src="/assets/images/ai-powered-support.png"
                alt="AI-Powered Support"
                width={48}
                height={48}
                className="object-contain"
              />
              </div>
            )}
            title={t('feature1_title')}
          >
            {t('feature1_description')}
          </FeatureCard>

          <FeatureCard
            icon={(
              <div className="flex items-center justify-center">
              <Image
                src="/assets/images/chat.png"
                alt="AI-Powered Support"
                width={48}
                height={48}
                className="object-contain"
              />
              </div>
            )}
            title={t('feature2_title')}
          >
            {t('feature2_description')}
          </FeatureCard>

          <FeatureCard
            icon={(
              <div className="flex items-center justify-center">
              <Image
                src="/assets/images/customer.png"
                alt="AI-Powered Support"
                width={48}
                height={48}
                className="object-contain"
              />
              </div>
            )}
            title={t('feature3_title')}
          >
            {t('feature3_description')}
          </FeatureCard>

          <FeatureCard
            icon={(
              <svg
                className="stroke-primary-foreground stroke-2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Filter/Funnel icon */}
                <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
              </svg>
            )}
            title={t('feature4_title')}
          >
            {t('feature4_description')}
          </FeatureCard>

          <FeatureCard
            icon={(
              <div className="flex items-center justify-center">
                <Image
                  src="/assets/images/ai-powered-support.png"
                  alt="AI-Powered Support"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
            )}
            title={t('feature5_title')}
          >
            {t('feature5_description')}
          </FeatureCard>

          <FeatureCard
            icon={(
              <div className="flex items-center justify-center">
              <Image
                src="/assets/images/code.png"
                alt="AI-Powered Support"
                width={48}
                height={48}
                className="object-contain"
              />
              </div>
            )}
            title={t('feature6_title')}
          >
            {t('feature6_description')}
          </FeatureCard>
        </div>
      </Section>
    </Background>
  );
};
