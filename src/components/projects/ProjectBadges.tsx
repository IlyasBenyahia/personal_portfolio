import { useTranslations } from 'next-intl';
import type { Project } from '@/content/types';
import { Badge, LockIcon } from '@/components/ui/Badge';

export function ProjectBadges({ project }: { project: Project }) {
  const t = useTranslations('Projects');
  if (!project.privateSource && !project.placeholder) return null;
  return (
    <p className="flex flex-wrap gap-2">
      {project.privateSource && (
        <Badge>
          <LockIcon />
          {t('privateSource')}
        </Badge>
      )}
      {project.placeholder && <Badge tone="todo">{t('placeholder')}</Badge>}
    </p>
  );
}
