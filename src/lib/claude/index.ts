import Anthropic from '@anthropic-ai/sdk';

/**
 * Клієнт Claude. Створюється лениво і лише якщо задано ANTHROPIC_API_KEY —
 * без ключа розбір лишається на локальних правилах, так само як без
 * DATABASE_URL сайт лишається анонімним (CONCEPT 8.1). Відсутність ключа —
 * це пропущений шар, а не помилка застосунку.
 */
let cached: Anthropic | null = null;

export function getClaude(): Anthropic | null {
  if (cached) return cached;
  // Конструктор без аргументів читає ANTHROPIC_API_KEY сам. Перевірка потрібна
  // раніше за нього: інакше «ключа немає» перетворилося б на помилку першого
  // запиту замість тихого фолбеку.
  if (!process.env.ANTHROPIC_API_KEY) return null;

  cached = new Anthropic();
  return cached;
}

/**
 * Модель для розбору. Sonnet 5 обрано за заміром, а не за замовчуванням: на
 * контрольному тексті з пастками («a tired engineer», «had lunch», «have seen»)
 * він дав ті самі сім конструкцій, що й Opus 5, коштуючи приблизно вдвічі
 * дешевше. Haiku 4.5 на тому ж тексті пропустив два звичайні Past Simple, тому
 * як дефолт не годиться.
 *
 * Змінна середовища лишається: модель — це те, що перевіряють заміром, а не
 * правкою коду.
 */
export const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-5';
