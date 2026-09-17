import type {
  ComparisonCategory,
  ComparisonResult,
  ComparisonStats,
  Question,
  QuestionBlock,
} from '../types';

export type ResultTone = 'in_sync' | 'balanced' | 'discovering';
export type BlockPortraitState = 'shared' | 'complementary' | 'explore';

export interface ResultPresentation {
  tone: ResultTone;
  title: string;
  message: string;
}

export interface BlockPortrait {
  block: QuestionBlock;
  label: string;
  state: BlockPortraitState;
  stateLabel: string;
  note: string;
}

const BLOCK_ORDER: QuestionBlock[] = ['support', 'communication', 'time', 'direction'];

const BLOCK_LABELS: Record<QuestionBlock, string> = {
  support: 'Поддержка',
  communication: 'Общение',
  time: 'Время и границы',
  direction: 'Направление',
};

const CATEGORY_WEIGHT: Record<ComparisonCategory, number> = {
  match: 1,
  soft_difference: 0.58,
  dialogue_topic: 0.22,
};

export function getResultPresentation(stats: ComparisonStats): ResultPresentation {
  const matchRatio = stats.totalQuestions > 0 ? stats.matchCount / stats.totalQuestions : 0;

  if (matchRatio >= 2 / 3) {
    return {
      tone: 'in_sync',
      title: 'Вы легко ловите общий ритм',
      message: 'Во многих важных деталях вы чувствуете отношения похоже — это тёплая основа для близости.',
    };
  }

  if (matchRatio >= 0.4) {
    return {
      tone: 'balanced',
      title: 'Вы похожи в важном и дополняете друг друга',
      message: 'У вас есть общий язык, а различия помогают замечать больше и узнавать друг друга глубже.',
    };
  }

  return {
    tone: 'discovering',
    title: 'У вас много поводов узнать друг друга глубже',
    message: 'Разные ответы — не дистанция, а готовые темы для спокойного и любопытного разговора.',
  };
}

export function getFeaturedResults(results: ComparisonResult[]): ComparisonResult[] {
  const featured: ComparisonResult[] = [];
  const pickedIds = new Set<string>();
  const categoryOrder: ComparisonCategory[] = ['match', 'soft_difference', 'dialogue_topic'];

  categoryOrder.forEach((category) => {
    const result = results.find((item) => item.category === category && !pickedIds.has(item.questionId));
    if (result) {
      featured.push(result);
      pickedIds.add(result.questionId);
    }
  });

  for (const result of results) {
    if (featured.length >= 3) break;
    if (!pickedIds.has(result.questionId)) {
      featured.push(result);
      pickedIds.add(result.questionId);
    }
  }

  return featured;
}

export function getBlockPortrait(
  results: ComparisonResult[],
  questions: Question[],
): BlockPortrait[] {
  return BLOCK_ORDER.map((block) => {
    // Free-text responses are invitations to compare thoughts, not a reliable
    // similarity signal, so the portrait uses only comparable answer types.
    const comparableQuestionIds = questions
      .filter((question) => question.block === block && question.type !== 'text')
      .map((question) => question.id);
    const blockResults = results.filter((result) => comparableQuestionIds.includes(result.questionId));
    const average = blockResults.length > 0
      ? blockResults.reduce((sum, result) => sum + CATEGORY_WEIGHT[result.category], 0) / blockResults.length
      : 0;

    if (average >= 0.75) {
      return {
        block,
        label: BLOCK_LABELS[block],
        state: 'shared',
        stateLabel: 'Общий ритм',
        note: 'Здесь вам особенно легко понимать друг друга.',
      };
    }

    if (average >= 0.48) {
      return {
        block,
        label: BLOCK_LABELS[block],
        state: 'complementary',
        stateLabel: 'Дополняете друг друга',
        note: 'Похожие ценности сочетаются с разными привычками.',
      };
    }

    return {
      block,
      label: BLOCK_LABELS[block],
      state: 'explore',
      stateLabel: 'Есть что обсудить',
      note: 'Любопытство и спокойный разговор особенно пригодятся.',
    };
  });
}
