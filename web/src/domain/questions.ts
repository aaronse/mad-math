import type { Operation, Question, RandomSource } from './types';

const displayOperatorByOperation: Record<Operation, string> = {
  '+': '+',
  '-': '-',
  '*': 'x',
  '/': '/'
};

export function getDisplayOperator(operation: Operation): string {
  return displayOperatorByOperation[operation];
}

export function getAnswer(left: number, right: number, operation: Operation): number {
  switch (operation) {
    case '+':
      return left + right;
    case '-':
      return left - right;
    case '*':
      return left * right;
    case '/':
      return left / right;
  }
}

function makeQuestion(left: number, right: number, operation: Operation): Question {
  const displayOperator = getDisplayOperator(operation);
  return {
    id: `${left}${operation}${right}`,
    left,
    right,
    operation,
    displayOperator,
    prompt: `${left} ${displayOperator} ${right} =`,
    answer: getAnswer(left, right, operation)
  };
}

export function buildQuestionPool(operations: Operation[]): Question[] {
  const pool: Question[] = [];

  for (const operation of operations) {
    if (operation === '+') {
      for (let left = 0; left <= 9; left += 1) {
        for (let right = 0; right <= 9; right += 1) {
          pool.push(makeQuestion(left, right, operation));
        }
      }
    }

    if (operation === '*') {
      for (let left = 0; left <= 9; left += 1) {
        for (let right = 0; right <= 9; right += 1) {
          pool.push(makeQuestion(left, right, operation));
        }
      }
    }

    if (operation === '-') {
      for (let left = 0; left <= 9; left += 1) {
        for (let right = 0; right <= left; right += 1) {
          pool.push(makeQuestion(left, right, operation));
        }
      }
    }

    if (operation === '/') {
      for (let right = 1; right <= 9; right += 1) {
        for (let answer = 1; answer <= 10; answer += 1) {
          pool.push(makeQuestion(right * answer, right, operation));
        }
      }
    }
  }

  return pool;
}

export function shuffleQuestions(questions: Question[], random: RandomSource = Math.random): Question[] {
  const shuffled = [...questions];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function createQuestionSet(
  operations: Operation[],
  questionCount: number,
  random: RandomSource = Math.random
): Question[] {
  const pool = buildQuestionPool(operations);

  if (pool.length === 0) {
    throw new Error('Select at least one operation.');
  }

  const selected: Question[] = [];
  while (selected.length < questionCount) {
    const nextPool = shuffleQuestions(pool, random);
    selected.push(...nextPool.slice(0, questionCount - selected.length));
  }

  return selected.map((question, index) => ({
    ...question,
    id: `${question.id}-${index}`
  }));
}

export function isAnswerCorrect(question: Question, answer: number): boolean {
  return question.answer === answer;
}