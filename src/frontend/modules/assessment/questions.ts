export interface QuestionOption {
  label: string
  value: number
}

export type QuestionId = 'routine' | 'communication' | 'creative' | 'physical' | 'aiuse'

export interface Question {
  id: QuestionId
  title: string
  hint: string
  options: QuestionOption[]
}

export const questions: Question[] = [
  {
    id: 'routine',
    title: 'Какая часть вашей работы состоит из повторяющихся задач по известному шаблону?',
    hint: 'Шаблонные операции проще всего передать машине.',
    options: [
      { label: 'Почти ничего', value: 0 },
      { label: 'Небольшая часть', value: 33 },
      { label: 'Значительная часть', value: 66 },
      { label: 'Почти вся работа', value: 100 },
    ],
  },
  {
    id: 'communication',
    title: 'Как много в вашей работе живого общения, где важны доверие и эмпатия?',
    hint: 'Живое общение пока остается сильной стороной человека.',
    options: [
      { label: 'Постоянно', value: 100 },
      { label: 'Часто', value: 66 },
      { label: 'Иногда', value: 33 },
      { label: 'Почти нет', value: 0 },
    ],
  },
  {
    id: 'creative',
    title: 'Как часто вы решаете нестандартные задачи без готового алгоритма?',
    hint: 'Нестандартные решения сложнее передать алгоритму.',
    options: [
      { label: 'Каждый день', value: 100 },
      { label: 'Часто', value: 66 },
      { label: 'Изредка', value: 33 },
      { label: 'Практически никогда', value: 0 },
    ],
  },
  {
    id: 'physical',
    title: 'Насколько ваша работа связана с действиями руками в непредсказуемой физической среде?',
    hint: 'Работа руками в меняющейся среде автоматизируется медленно.',
    options: [
      { label: 'Полностью', value: 100 },
      { label: 'Заметно', value: 66 },
      { label: 'Немного', value: 33 },
      { label: 'Никак', value: 0 },
    ],
  },
  {
    id: 'aiuse',
    title: 'Насколько активно вы уже используете инструменты ИИ в работе?',
    hint: 'Опыт работы с инструментами ИИ повышает вашу устойчивость.',
    options: [
      { label: 'Ежедневно и глубоко', value: 100 },
      { label: 'Регулярно', value: 66 },
      { label: 'Иногда', value: 33 },
      { label: 'Не использую', value: 0 },
    ],
  },
]
