import type { BranchId, TaskKey } from '@backend/engine/riskEngineV2'

export interface TaskType {
  key: TaskKey
  label: string
  hint: string
}

// Allocation step. The user distributes 100 percent across these task types.
export const TASK_TYPES: TaskType[] = [
  {
    key: 'routine',
    label: 'Шаблонные операции по инструкции',
    hint: 'Повторяющиеся действия по известному образцу.',
  },
  {
    key: 'social',
    label: 'Общение с людьми',
    hint: 'Переговоры, поддержка, согласование интересов.',
  },
  {
    key: 'creative',
    label: 'Создание нового и нестандартные задачи',
    hint: 'Работа без готового алгоритма и решения.',
  },
  {
    key: 'physical',
    label: 'Ручная работа в физическом мире',
    hint: 'Действия руками с реальными объектами.',
  },
  {
    key: 'info',
    label: 'Анализ информации, тексты и данные',
    hint: 'Работа с документами, цифрами и отчетами.',
  },
]

export interface QuestionOptionV2 {
  label: string
  value: number
}

export interface QuestionV2 {
  title: string
  hint: string
  options: QuestionOptionV2[]
}

// In every branch a higher option value means the work is more automatable.
export const BRANCHES: Record<BranchId, QuestionV2[]> = {
  physical: [
    {
      title: 'Насколько предсказуема физическая среда, в которой вы работаете?',
      hint: 'Стабильную обстановку проще передать технике.',
      options: [
        { label: 'Каждый раз новая и непредсказуемая', value: 0 },
        { label: 'Часто меняется', value: 33 },
        { label: 'В основном стабильная', value: 66 },
        { label: 'Полностью предсказуемая', value: 100 },
      ],
    },
    {
      title: 'Насколько стандартизированы предметы, с которыми вы работаете?',
      hint: 'Одинаковые объекты легче обрабатывать автоматически.',
      options: [
        { label: 'Каждый объект уникален', value: 0 },
        { label: 'Есть заметные различия', value: 33 },
        { label: 'В основном похожи', value: 66 },
        { label: 'Полностью одинаковые', value: 100 },
      ],
    },
    {
      title: 'Как часто решения приходится принимать на месте, без инструкции?',
      hint: 'Решения по ситуации пока остаются за человеком.',
      options: [
        { label: 'Почти каждое решение', value: 0 },
        { label: 'Часто', value: 33 },
        { label: 'Изредка', value: 66 },
        { label: 'Почти никогда, все по инструкции', value: 100 },
      ],
    },
  ],
  social: [
    {
      title: 'Какого рода контакты преобладают в вашей работе?',
      hint: 'Глубокие отношения сложнее заменить сценарием.',
      options: [
        { label: 'Долгие доверительные отношения', value: 0 },
        { label: 'Регулярное личное общение', value: 33 },
        { label: 'Короткие деловые контакты', value: 66 },
        { label: 'Разовые контакты по скрипту', value: 100 },
      ],
    },
    {
      title: 'Насколько эмоционально сложны ваши взаимодействия?',
      hint: 'Тонкая эмпатия остается сильной стороной человека.',
      options: [
        { label: 'Очень сложные, много эмпатии', value: 0 },
        { label: 'Заметно сложные', value: 33 },
        { label: 'Обычно простые', value: 66 },
        { label: 'Совсем простые и формальные', value: 100 },
      ],
    },
    {
      title: 'Какая часть общения идет по готовому сценарию?',
      hint: 'Сценарные диалоги проще автоматизировать.',
      options: [
        { label: 'Почти нет сценариев', value: 0 },
        { label: 'Небольшая часть', value: 33 },
        { label: 'Значительная часть', value: 66 },
        { label: 'Почти все по сценарию', value: 100 },
      ],
    },
  ],
  cognitive: [
    {
      title: 'Какая часть работы это тексты, код, таблицы или отчеты?',
      hint: 'Такую работу инструменты ИИ подхватывают быстрее всего.',
      options: [
        { label: 'Почти нет такой работы', value: 0 },
        { label: 'Небольшая часть', value: 33 },
        { label: 'Значительная часть', value: 66 },
        { label: 'Почти вся работа', value: 100 },
      ],
    },
    {
      title: 'Насколько результат можно проверить по формальному правилу?',
      hint: 'Проверяемый по правилу результат легче автоматизировать.',
      options: [
        { label: 'Проверить почти нельзя', value: 0 },
        { label: 'Частично', value: 33 },
        { label: 'В основном можно', value: 66 },
        { label: 'Полностью по правилу', value: 100 },
      ],
    },
    {
      title: 'Как часто задачи требуют придумывать подход без готового примера?',
      hint: 'Работа без прецедента пока сложна для алгоритмов.',
      options: [
        { label: 'Почти каждый раз', value: 0 },
        { label: 'Часто', value: 33 },
        { label: 'Изредка', value: 66 },
        { label: 'Почти никогда', value: 100 },
      ],
    },
  ],
}

// Readiness questions. A higher value means the person is more ready.
export const READINESS_QUESTIONS: QuestionV2[] = [
  {
    title: 'Насколько активно вы уже используете инструменты ИИ в работе?',
    hint: 'Опыт работы с ИИ повышает вашу устойчивость.',
    options: [
      { label: 'Не использую', value: 0 },
      { label: 'Иногда пробую', value: 33 },
      { label: 'Регулярно', value: 66 },
      { label: 'Ежедневно и глубоко', value: 100 },
    ],
  },
  {
    title: 'Сколько часов в неделю реально есть на обучение?',
    hint: 'Даже небольшое регулярное время дает результат.',
    options: [
      { label: 'Почти нет времени', value: 0 },
      { label: 'Один или два часа', value: 33 },
      { label: 'Три или пять часов', value: 66 },
      { label: 'Шесть и более часов', value: 100 },
    ],
  },
  {
    title: 'На сколько месяцев расходов хватит вашей подушки безопасности?',
    hint: 'Финансовый запас дает спокойствие для перемен.',
    options: [
      { label: 'Подушки пока нет', value: 0 },
      { label: 'До одного месяца', value: 33 },
      { label: 'От двух до четырех месяцев', value: 66 },
      { label: 'Полгода и больше', value: 100 },
    ],
  },
]

// Context questions. context[0] is exposure, context[1] is readiness.
export const CONTEXT_QUESTIONS: QuestionV2[] = [
  {
    title: 'Как быстро ИИ внедряется в вашей отрасли и компании?',
    hint: 'Быстрое внедрение усиливает давление на профессию.',
    options: [
      { label: 'Почти не внедряется', value: 0 },
      { label: 'Медленно', value: 33 },
      { label: 'Заметно', value: 66 },
      { label: 'Очень быстро', value: 100 },
    ],
  },
  {
    title: 'Насколько легко перенести ваши навыки в смежные роли?',
    hint: 'Переносимые навыки расширяют пространство выбора.',
    options: [
      { label: 'Очень сложно', value: 0 },
      { label: 'Скорее сложно', value: 33 },
      { label: 'Скорее легко', value: 66 },
      { label: 'Очень легко', value: 100 },
    ],
  },
]
