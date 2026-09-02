import type { MDXComponents } from 'mdx/types';

import {
  Badge,
  Bad,
  BRow,
  Breakdown,
  Card,
  CardTitle,
  Cheat,
  CheatCode,
  CheatRow,
  Chip,
  Chips,
  Cm,
  En,
  Ex,
  ExList,
  Formula,
  FormulaOf,
  Good,
  GoodBad,
  Grid2,
  Grid3,
  H2,
  H3,
  H4,
  Hr,
  InlineCode,
  K,
  Lede,
  Li,
  M,
  Meh,
  MP,
  MPRow,
  Muted,
  Neg,
  History,
  Note,
  Ol,
  P,
  Q,
  Story,
  SvgBox,
  Table,
  Td,
  TenseHead,
  Th,
  Tr,
  Ua,
  Ul,
} from '@/components/content/blocks';
import { Drills } from '@/components/content/Drills';
import { HighlightLegend } from '@/components/content/HighlightLegend';
import { IrregularVerbs, StateVerbs } from '@/components/content/IrregularVerbs';
import { Section } from '@/components/content/Section';
import { Quiz } from '@/components/quiz/Quiz';
import { SecRef } from '@/components/topic/SectionRef';

/**
 * Одна мапа для всього MDX: і розмітка markdown, і компоненти теми.
 * Завдяки їй у тексті теми не потрібні імпорти — просто <Note>, <ExList>, <M>.
 */
export function useMDXComponents(components: MDXComponents = {}): MDXComponents {
  return {
    // markdown
    h2: H2,
    h3: H3,
    h4: H4,
    p: P,
    ul: Ul,
    ol: Ol,
    li: Li,
    code: InlineCode,
    hr: Hr,
    table: Table,
    tr: Tr,
    th: Th,
    td: Td,
    blockquote: ({ children }) => <Note>{children}</Note>,

    // ті самі заголовки, абзац і списки, але як явні теги в MDX — потрібні
    // там, де текст стоїть поруч із JSX-сусідами всередині картки чи виноски
    // і розмітка markdown до нього вже не застосовується
    H2,
    H3,
    H4,
    P,
    Ul,
    Ol,
    Li,

    // блоки теми
    Section,
    SecRef,
    Lede,
    Muted,
    Card,
    CardTitle,
    Grid2,
    Grid3,
    TenseHead,
    Badge,
    Formula,
    FormulaOf,
    K,
    Neg,
    Q,
    Cm,
    ExList,
    Ex,
    GoodBad,
    Bad,
    Good,
    Meh,
    History,
    Note,
    MP,
    MPRow,
    Chips,
    Chip,
    Story,
    Breakdown,
    BRow,
    Cheat,
    CheatRow,
    CheatCode,
    SvgBox,
    En,
    Ua,
    M,

    // інтерактив і дані
    Drills,
    HighlightLegend,
    Quiz,
    IrregularVerbs,
    StateVerbs,

    ...components,
  };
}
