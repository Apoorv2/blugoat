import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { CTA } from '@/templates/CTA';
import { DemoBanner } from '@/templates/DemoBanner';
import { FAQ } from '@/templates/FAQ';
import { Features } from '@/templates/Features';
import { Footer } from '@/templates/Footer';
import { Hero } from '@/templates/Hero';
import { Navbar } from '@/templates/Navbar';
import { Pricing } from '@/templates/Pricing';
import { Sponsors } from '@/templates/Sponsors';

// eslint-disable-next-line no-console
console.log('ENV CHECK:', {
  hasSecretKey: !!process.env.CLERK_SECRET_KEY,
  firstChars: process.env.CLERK_SECRET_KEY?.substring(0, 4),
  otherKeys: {
    hasPublishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    hasSignInUrl: !!process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL,
    hasSignUpUrl: !!process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
  },
});

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Index',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

const IndexPage = (props: { params: { locale: string } }) => {
  unstable_setRequestLocale(props.params.locale);

  return (
    <>
      <DemoBanner />
      <Navbar />
      <Hero />
      <Sponsors />
      <Features />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </>
  );
};

export default IndexPage;
