import { getTranslations } from 'next-intl/server';

import { SignInClient } from './client';

export async function generateMetadata(props: { params: { locale: string } }) {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'SignIn',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default function SignInPage(props: { params: { locale: string } }) {
  return <SignInClient locale={props.params.locale} />;
}
