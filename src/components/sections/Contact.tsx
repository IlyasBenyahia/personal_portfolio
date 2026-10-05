import { useLocale, useTranslations } from 'next-intl';
import { profile } from '@/content/profile';
import { ContactForm } from '@/components/contact/ContactForm';
import { ExternalLink } from '@/components/ui/ExternalLink';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { trackAttrs } from '@/lib/analytics';

export function Contact({ index }: { index: number }) {
  const t = useTranslations('Contact');
  const tForm = useTranslations('ContactForm');
  const locale = useLocale();

  return (
    <Section id="contact">
      <SectionHeading id="contact-title" index={index} title={t('title')} intro={t('intro')} />
      <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="grid content-start gap-10">
          <dl className="grid content-start gap-8">
            <div>
              <dt className="font-mono text-xs tracking-widest text-muted uppercase">
                {t('email')}
              </dt>
              <dd className="mt-2">
                <a
                  href={`mailto:${profile.email}`}
                  className="font-display text-2xl break-all underline decoration-line underline-offset-4 transition hover:decoration-accent sm:text-3xl"
                >
                  {profile.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-mono text-xs tracking-widest text-muted uppercase">
                {t('whatsapp')}
              </dt>
              <dd className="mt-2">
                <ExternalLink
                  href={profile.whatsappUrl}
                  {...trackAttrs('outbound_click', { target: 'whatsapp' })}
                  className="inline-flex rounded-full border border-fg/30 px-5 py-2.5 font-medium transition hover:border-fg"
                >
                  {t('whatsappCta')} ↗
                </ExternalLink>
              </dd>
            </div>
            <div>
              <dt className="font-mono text-xs tracking-widest text-muted uppercase">
                {t('elsewhere')}
              </dt>
              <dd className="mt-2">
                <ul className="flex flex-wrap gap-x-6 gap-y-2">
                  {profile.socials.map((s) => (
                    <li key={s.id}>
                      <ExternalLink
                        href={s.url}
                        {...trackAttrs('outbound_click', { target: s.id })}
                        className="underline decoration-line underline-offset-4 transition hover:decoration-accent"
                      >
                        {s.label}
                      </ExternalLink>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>

          <div>
            <h3 className="font-display text-2xl font-semibold">{t('cv')}</h3>
            {/* TODO: add the PDF files to public/cv/ (see profile.cv). */}
            <ul className="mt-6 grid gap-3">
              {(['fr', 'en'] as const).map((lang) => (
                <li key={lang}>
                  <a
                    href={profile.cv[lang]}
                    {...trackAttrs('cv_download', { lang })}
                    download
                    hrefLang={lang}
                    className={`flex items-center justify-between rounded-xl px-5 py-4 font-medium transition ${
                      lang === locale
                        ? 'bg-accent-strong text-on-accent hover:brightness-110'
                        : 'border border-fg/30 hover:border-fg'
                    }`}
                  >
                    {lang === 'fr' ? t('cvFr') : t('cvEn')}
                    <span aria-hidden="true">↓</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
          <h3 className="font-display text-2xl font-semibold">{tForm('title')}</h3>
          <div className="mt-6">
            <ContactForm email={profile.email} />
          </div>
        </div>
      </div>
    </Section>
  );
}
