import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

const config = [
  /*
   * Шаблони вивідних каталогів написані з `**` на початку навмисно. Кореневий
   * `.next/**` не збігається з ВКЛАДЕНИМ шляхом, тому будь-яка копія репозиторію
   * всередині робочого дерева приносила свою збірку прямо в перевірку. Саме так
   * і сталося: агентський git-worktree у `.claude/worktrees/` уже був зібраний,
   * і `npm run lint` видав сотні помилок у чужих артефактах.
   *
   * `.claude/**` лишається окремо — там житло інструментів і тимчасові
   * worktree, наш код туди не потрапляє за жодних умов.
   *
   * `.design-verify` — копії макета й артефакти звірки, теж не наш код.
   */
  {
    ignores: [
      '**/.next/**',
      '**/node_modules/**',
      'drizzle/**',
      'next-env.d.ts',
      '.design-verify/**',
      '.claude/**',
    ],
  },
  ...coreWebVitals,
  ...typescript,
];

export default config;
