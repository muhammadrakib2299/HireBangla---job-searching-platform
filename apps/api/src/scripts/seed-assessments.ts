import mongoose from 'mongoose';
import { config } from 'dotenv';
import { Assessment } from '../models/Assessment.js';
import { Skill } from '../models/Skill.js';
import { generateSlug } from '../utils/slug.js';
import { AssessmentDifficulty, QuestionType } from '@job-platform/shared-types';

config();

const assessments = [
  // ─── JavaScript Beginner ──────────────────────────────────────────────────
  {
    title: 'JavaScript Fundamentals',
    description:
      'Test your understanding of JavaScript basics including variables, data types, functions, and control flow.',
    skillName: 'JavaScript',
    difficulty: AssessmentDifficulty.BEGINNER,
    duration: 15,
    passingScore: 70,
    questions: [
      {
        questionText: 'Which keyword is used to declare a constant in JavaScript?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'var', isCorrect: false },
          { text: 'let', isCorrect: false },
          { text: 'const', isCorrect: true },
          { text: 'define', isCorrect: false },
        ],
        explanation: '`const` declares a block-scoped constant that cannot be reassigned.',
        points: 1,
      },
      {
        questionText: 'What is the output of: typeof null?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: '"null"', isCorrect: false },
          { text: '"object"', isCorrect: true },
          { text: '"undefined"', isCorrect: false },
          { text: '"boolean"', isCorrect: false },
        ],
        explanation:
          'This is a known JavaScript quirk. `typeof null` returns "object" due to a historical bug in the language.',
        points: 1,
      },
      {
        questionText: '`undefined` and `null` are the same in JavaScript.',
        questionType: QuestionType.TRUE_FALSE,
        options: [
          { text: 'True', isCorrect: false },
          { text: 'False', isCorrect: true },
        ],
        explanation:
          '`undefined` means a variable was declared but not assigned. `null` is an intentional absence of value. `null == undefined` is true, but `null === undefined` is false.',
        points: 1,
      },
      {
        questionText: 'Which method converts a JSON string to a JavaScript object?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'JSON.stringify()', isCorrect: false },
          { text: 'JSON.parse()', isCorrect: true },
          { text: 'JSON.toObject()', isCorrect: false },
          { text: 'JSON.decode()', isCorrect: false },
        ],
        explanation: '`JSON.parse()` parses a JSON string and returns a JavaScript object.',
        points: 1,
      },
      {
        questionText: 'What does the `===` operator check?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'Value only', isCorrect: false },
          { text: 'Type only', isCorrect: false },
          { text: 'Value and type', isCorrect: true },
          { text: 'Reference equality', isCorrect: false },
        ],
        explanation:
          'The strict equality operator `===` checks both value and type without type coercion.',
        points: 1,
      },
      {
        questionText: 'Which array method adds elements to the end of an array?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'unshift()', isCorrect: false },
          { text: 'push()', isCorrect: true },
          { text: 'concat()', isCorrect: false },
          { text: 'splice()', isCorrect: false },
        ],
        explanation: '`push()` adds one or more elements to the end of an array and returns the new length.',
        points: 1,
      },
      {
        questionText: 'Arrow functions have their own `this` context.',
        questionType: QuestionType.TRUE_FALSE,
        options: [
          { text: 'True', isCorrect: false },
          { text: 'False', isCorrect: true },
        ],
        explanation:
          'Arrow functions do NOT have their own `this`. They inherit `this` from the enclosing lexical scope.',
        points: 1,
      },
      {
        questionText: 'What will this code output?',
        questionType: QuestionType.CODE_SNIPPET,
        codeSnippet: 'console.log(2 + "2");',
        options: [
          { text: '4', isCorrect: false },
          { text: '"22"', isCorrect: true },
          { text: 'NaN', isCorrect: false },
          { text: 'Error', isCorrect: false },
        ],
        explanation:
          'When using `+` with a string, JavaScript performs string concatenation. The number 2 is converted to "2", resulting in "22".',
        points: 2,
      },
      {
        questionText: 'What is the result of this expression?',
        questionType: QuestionType.CODE_SNIPPET,
        codeSnippet: '[1, 2, 3].map(x => x * 2)',
        options: [
          { text: '[2, 4, 6]', isCorrect: true },
          { text: '[1, 2, 3]', isCorrect: false },
          { text: '12', isCorrect: false },
          { text: 'undefined', isCorrect: false },
        ],
        explanation: '`map()` creates a new array by applying the callback to each element.',
        points: 2,
      },
      {
        questionText: 'Which statement correctly creates a Promise?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'new Promise((resolve, reject) => { })', isCorrect: true },
          { text: 'Promise.new((resolve, reject) => { })', isCorrect: false },
          { text: 'Promise.create((resolve) => { })', isCorrect: false },
          { text: 'async Promise((resolve) => { })', isCorrect: false },
        ],
        explanation:
          'A Promise is created using the `new Promise()` constructor with executor function receiving resolve and reject.',
        points: 1,
      },
    ],
  },

  // ─── JavaScript Intermediate ──────────────────────────────────────────────
  {
    title: 'JavaScript: Closures, Async & ES6+',
    description:
      'Intermediate assessment covering closures, async/await, destructuring, spread operator, and modern JavaScript features.',
    skillName: 'JavaScript',
    difficulty: AssessmentDifficulty.INTERMEDIATE,
    duration: 20,
    passingScore: 70,
    questions: [
      {
        questionText: 'What will this code log?',
        questionType: QuestionType.CODE_SNIPPET,
        codeSnippet: `function outer() {
  let count = 0;
  return function() { return ++count; };
}
const fn = outer();
console.log(fn(), fn(), fn());`,
        options: [
          { text: '1 1 1', isCorrect: false },
          { text: '1 2 3', isCorrect: true },
          { text: '0 1 2', isCorrect: false },
          { text: 'undefined undefined undefined', isCorrect: false },
        ],
        explanation:
          'The inner function forms a closure over `count`. Each call increments and returns the same variable.',
        points: 2,
      },
      {
        questionText: 'What does `async` keyword do when placed before a function?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'Makes the function run in parallel', isCorrect: false },
          { text: 'Makes the function return a Promise', isCorrect: true },
          { text: 'Makes the function run on a separate thread', isCorrect: false },
          { text: 'Makes the function execute immediately', isCorrect: false },
        ],
        explanation:
          'An `async` function always returns a Promise. If the function returns a value, the Promise resolves with that value.',
        points: 1,
      },
      {
        questionText: 'What is the output?',
        questionType: QuestionType.CODE_SNIPPET,
        codeSnippet: `const [a, ...rest] = [1, 2, 3, 4];
console.log(rest);`,
        options: [
          { text: '[2, 3, 4]', isCorrect: true },
          { text: '[1, 2, 3, 4]', isCorrect: false },
          { text: '[3, 4]', isCorrect: false },
          { text: '2', isCorrect: false },
        ],
        explanation:
          'Array destructuring with rest operator: `a` gets 1, and `rest` collects the remaining elements [2, 3, 4].',
        points: 2,
      },
      {
        questionText: 'What does `Promise.all()` do when one promise rejects?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'Ignores the rejected promise and returns the rest', isCorrect: false },
          { text: 'Returns undefined for the rejected promise', isCorrect: false },
          { text: 'Immediately rejects with the first rejection reason', isCorrect: true },
          { text: 'Waits for all promises and then throws', isCorrect: false },
        ],
        explanation:
          '`Promise.all()` is "fail-fast" — it rejects immediately when any input promise rejects.',
        points: 1,
      },
      {
        questionText: 'The `event loop` in JavaScript ensures that...',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'Code runs on multiple threads', isCorrect: false },
          { text: 'Asynchronous callbacks are executed after the call stack is empty', isCorrect: true },
          { text: 'DOM updates happen synchronously', isCorrect: false },
          { text: 'Variables are garbage collected', isCorrect: false },
        ],
        explanation:
          'The event loop checks the callback queue and pushes callbacks to the call stack when it is empty.',
        points: 1,
      },
      {
        questionText: 'What is the output?',
        questionType: QuestionType.CODE_SNIPPET,
        codeSnippet: `const obj = { a: 1, b: 2, c: 3 };
const { a, ...rest } = obj;
console.log(rest);`,
        options: [
          { text: '{ b: 2, c: 3 }', isCorrect: true },
          { text: '{ a: 1 }', isCorrect: false },
          { text: '[2, 3]', isCorrect: false },
          { text: 'undefined', isCorrect: false },
        ],
        explanation: 'Object destructuring with rest collects remaining properties into a new object.',
        points: 2,
      },
      {
        questionText: '`WeakMap` keys can be garbage collected when there are no other references to the key.',
        questionType: QuestionType.TRUE_FALSE,
        options: [
          { text: 'True', isCorrect: true },
          { text: 'False', isCorrect: false },
        ],
        explanation:
          'WeakMap holds weak references to keys, allowing garbage collection when no other references exist.',
        points: 1,
      },
      {
        questionText: 'What does `Object.freeze()` do?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'Prevents adding new properties only', isCorrect: false },
          { text: 'Makes object immutable (no add, delete, or modify)', isCorrect: true },
          { text: 'Deep freezes nested objects', isCorrect: false },
          { text: 'Converts object to a constant', isCorrect: false },
        ],
        explanation:
          '`Object.freeze()` makes an object shallowly immutable. Nested objects are NOT frozen.',
        points: 1,
      },
    ],
  },

  // ─── Python Beginner ──────────────────────────────────────────────────────
  {
    title: 'Python Fundamentals',
    description:
      'Assess your knowledge of Python basics: syntax, data types, loops, functions, and common built-in methods.',
    skillName: 'Python',
    difficulty: AssessmentDifficulty.BEGINNER,
    duration: 15,
    passingScore: 70,
    questions: [
      {
        questionText: 'Which keyword is used to define a function in Python?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'function', isCorrect: false },
          { text: 'func', isCorrect: false },
          { text: 'def', isCorrect: true },
          { text: 'fn', isCorrect: false },
        ],
        explanation: 'Python uses `def` to define functions.',
        points: 1,
      },
      {
        questionText: 'What is the output of this code?',
        questionType: QuestionType.CODE_SNIPPET,
        codeSnippet: 'print(type([]))',
        options: [
          { text: "<class 'list'>", isCorrect: true },
          { text: "<class 'array'>", isCorrect: false },
          { text: "<class 'tuple'>", isCorrect: false },
          { text: "<class 'dict'>", isCorrect: false },
        ],
        explanation: '`[]` creates an empty list in Python.',
        points: 1,
      },
      {
        questionText: 'Python uses indentation to define code blocks.',
        questionType: QuestionType.TRUE_FALSE,
        options: [
          { text: 'True', isCorrect: true },
          { text: 'False', isCorrect: false },
        ],
        explanation:
          'Python uses indentation (typically 4 spaces) instead of curly braces to define code blocks.',
        points: 1,
      },
      {
        questionText: 'What does `len("Hello")` return?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: '4', isCorrect: false },
          { text: '5', isCorrect: true },
          { text: '6', isCorrect: false },
          { text: 'Error', isCorrect: false },
        ],
        explanation: '`len()` returns the number of characters in a string. "Hello" has 5 characters.',
        points: 1,
      },
      {
        questionText: 'Which data type is immutable in Python?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'list', isCorrect: false },
          { text: 'dict', isCorrect: false },
          { text: 'set', isCorrect: false },
          { text: 'tuple', isCorrect: true },
        ],
        explanation: 'Tuples are immutable — their elements cannot be changed after creation.',
        points: 1,
      },
      {
        questionText: 'What is the output?',
        questionType: QuestionType.CODE_SNIPPET,
        codeSnippet: `x = [1, 2, 3]
y = x
y.append(4)
print(x)`,
        options: [
          { text: '[1, 2, 3]', isCorrect: false },
          { text: '[1, 2, 3, 4]', isCorrect: true },
          { text: '[4]', isCorrect: false },
          { text: 'Error', isCorrect: false },
        ],
        explanation:
          'Lists are mutable and `y = x` creates a reference, not a copy. Both `x` and `y` point to the same list.',
        points: 2,
      },
      {
        questionText: 'Which method removes and returns the last element of a list?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'remove()', isCorrect: false },
          { text: 'delete()', isCorrect: false },
          { text: 'pop()', isCorrect: true },
          { text: 'discard()', isCorrect: false },
        ],
        explanation: '`pop()` removes and returns the last element, or an element at a given index.',
        points: 1,
      },
      {
        questionText: 'What is the output?',
        questionType: QuestionType.CODE_SNIPPET,
        codeSnippet: 'print("hello".upper())',
        options: [
          { text: 'hello', isCorrect: false },
          { text: 'HELLO', isCorrect: true },
          { text: 'Hello', isCorrect: false },
          { text: 'Error', isCorrect: false },
        ],
        explanation: 'The `upper()` method returns the string with all characters in uppercase.',
        points: 1,
      },
      {
        questionText: 'What does `range(3)` produce?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: '[1, 2, 3]', isCorrect: false },
          { text: '[0, 1, 2]', isCorrect: true },
          { text: '[0, 1, 2, 3]', isCorrect: false },
          { text: '3', isCorrect: false },
        ],
        explanation: '`range(3)` produces numbers from 0 to 2 (0, 1, 2). The end is exclusive.',
        points: 1,
      },
      {
        questionText: 'In Python 3, `print` is a function, not a statement.',
        questionType: QuestionType.TRUE_FALSE,
        options: [
          { text: 'True', isCorrect: true },
          { text: 'False', isCorrect: false },
        ],
        explanation: 'In Python 3, `print()` is a built-in function and requires parentheses.',
        points: 1,
      },
    ],
  },

  // ─── Excel / Spreadsheet ──────────────────────────────────────────────────
  {
    title: 'Microsoft Excel Essentials',
    description:
      'Test your knowledge of Excel formulas, functions, and common spreadsheet operations used in everyday business tasks.',
    skillName: 'Microsoft Excel',
    difficulty: AssessmentDifficulty.BEGINNER,
    duration: 15,
    passingScore: 70,
    questions: [
      {
        questionText: 'Which function calculates the average of a range of cells?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'SUM()', isCorrect: false },
          { text: 'AVERAGE()', isCorrect: true },
          { text: 'MEAN()', isCorrect: false },
          { text: 'AVG()', isCorrect: false },
        ],
        explanation: 'The AVERAGE() function calculates the arithmetic mean of a range.',
        points: 1,
      },
      {
        questionText: 'What does the VLOOKUP function do?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'Looks up values vertically in a table', isCorrect: true },
          { text: 'Validates data in cells', isCorrect: false },
          { text: 'Creates vertical charts', isCorrect: false },
          { text: 'Merges cells vertically', isCorrect: false },
        ],
        explanation:
          'VLOOKUP searches for a value in the first column of a range and returns a value from a specified column.',
        points: 1,
      },
      {
        questionText: 'The $ symbol in a cell reference (e.g., $A$1) makes it an absolute reference.',
        questionType: QuestionType.TRUE_FALSE,
        options: [
          { text: 'True', isCorrect: true },
          { text: 'False', isCorrect: false },
        ],
        explanation:
          'The $ symbol locks the row and/or column so the reference does not change when copied.',
        points: 1,
      },
      {
        questionText: 'Which formula counts only cells that meet a specific condition?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'COUNT()', isCorrect: false },
          { text: 'COUNTA()', isCorrect: false },
          { text: 'COUNTIF()', isCorrect: true },
          { text: 'COUNTBLANK()', isCorrect: false },
        ],
        explanation:
          'COUNTIF() counts cells within a range that meet a given condition/criteria.',
        points: 1,
      },
      {
        questionText: 'What is the shortcut to select the entire current row in Excel?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'Ctrl + Space', isCorrect: false },
          { text: 'Shift + Space', isCorrect: true },
          { text: 'Alt + Space', isCorrect: false },
          { text: 'Ctrl + Shift + Space', isCorrect: false },
        ],
        explanation: 'Shift + Space selects the entire row of the active cell.',
        points: 1,
      },
      {
        questionText: 'Which function joins text from multiple cells?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'JOIN()', isCorrect: false },
          { text: 'MERGE()', isCorrect: false },
          { text: 'CONCATENATE() or CONCAT()', isCorrect: true },
          { text: 'COMBINE()', isCorrect: false },
        ],
        explanation: 'CONCATENATE() (or newer CONCAT()) joins text strings together.',
        points: 1,
      },
      {
        questionText: 'What does the IF function do in Excel?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'Loops through a range', isCorrect: false },
          { text: 'Returns one value if a condition is true, another if false', isCorrect: true },
          { text: 'Filters data in a table', isCorrect: false },
          { text: 'Imports data from external source', isCorrect: false },
        ],
        explanation:
          'IF(condition, value_if_true, value_if_false) performs a logical test and returns different values.',
        points: 1,
      },
      {
        questionText: 'A PivotTable is used to summarize and analyze large datasets.',
        questionType: QuestionType.TRUE_FALSE,
        options: [
          { text: 'True', isCorrect: true },
          { text: 'False', isCorrect: false },
        ],
        explanation:
          'PivotTables allow you to summarize, sort, reorganize, group, count, total or average data in a table.',
        points: 1,
      },
      {
        questionText: 'What does =SUM(A1:A5) calculate?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'Sum of A1 and A5 only', isCorrect: false },
          { text: 'Sum of all cells from A1 through A5', isCorrect: true },
          { text: 'Count of cells from A1 to A5', isCorrect: false },
          { text: 'Average of A1 through A5', isCorrect: false },
        ],
        explanation: 'SUM(A1:A5) adds up the values in cells A1, A2, A3, A4, and A5.',
        points: 1,
      },
      {
        questionText: 'Which feature lets you apply formatting based on cell values?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'Data Validation', isCorrect: false },
          { text: 'Conditional Formatting', isCorrect: true },
          { text: 'AutoFormat', isCorrect: false },
          { text: 'Cell Styles', isCorrect: false },
        ],
        explanation:
          'Conditional Formatting applies formatting (colors, icons, bars) based on cell values or formulas.',
        points: 1,
      },
    ],
  },

  // ─── English Proficiency ──────────────────────────────────────────────────
  {
    title: 'English Language Proficiency',
    description:
      'Evaluate your English grammar, vocabulary, and comprehension skills relevant to professional communication.',
    skillName: 'English',
    difficulty: AssessmentDifficulty.BEGINNER,
    duration: 15,
    passingScore: 70,
    questions: [
      {
        questionText: 'Choose the correct sentence:',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'She don\'t like coffee.', isCorrect: false },
          { text: 'She doesn\'t likes coffee.', isCorrect: false },
          { text: 'She doesn\'t like coffee.', isCorrect: true },
          { text: 'She not like coffee.', isCorrect: false },
        ],
        explanation:
          'With third-person singular (she/he/it), we use "doesn\'t" + base form of the verb.',
        points: 1,
      },
      {
        questionText: 'Which word best fills the blank: "The report was _____ by the manager."',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'approve', isCorrect: false },
          { text: 'approved', isCorrect: true },
          { text: 'approving', isCorrect: false },
          { text: 'approves', isCorrect: false },
        ],
        explanation: 'Passive voice requires "was + past participle". "approved" is the past participle.',
        points: 1,
      },
      {
        questionText: '"Their", "there", and "they\'re" all have the same meaning.',
        questionType: QuestionType.TRUE_FALSE,
        options: [
          { text: 'True', isCorrect: false },
          { text: 'False', isCorrect: true },
        ],
        explanation:
          '"Their" = possessive, "there" = location/existence, "they\'re" = they are. All different meanings.',
        points: 1,
      },
      {
        questionText: 'Select the correct form: "If I _____ you, I would apply for that job."',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'am', isCorrect: false },
          { text: 'was', isCorrect: false },
          { text: 'were', isCorrect: true },
          { text: 'be', isCorrect: false },
        ],
        explanation:
          'In the second conditional (hypothetical), we use "were" for all subjects: "If I were you..."',
        points: 1,
      },
      {
        questionText: 'What is the meaning of "deadline"?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'A dangerous line', isCorrect: false },
          { text: 'The latest time by which something must be completed', isCorrect: true },
          { text: 'A type of line graph', isCorrect: false },
          { text: 'The end of a phone line', isCorrect: false },
        ],
        explanation: 'A "deadline" is the final date or time by which a task must be finished.',
        points: 1,
      },
      {
        questionText: 'Choose the correct preposition: "She is good _____ mathematics."',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'in', isCorrect: false },
          { text: 'at', isCorrect: true },
          { text: 'on', isCorrect: false },
          { text: 'for', isCorrect: false },
        ],
        explanation: 'The correct collocation is "good at" when referring to skills or subjects.',
        points: 1,
      },
      {
        questionText: 'Which sentence uses the present perfect tense correctly?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'I have went to Dhaka last week.', isCorrect: false },
          { text: 'I have been to Dhaka.', isCorrect: true },
          { text: 'I has been to Dhaka.', isCorrect: false },
          { text: 'I have go to Dhaka.', isCorrect: false },
        ],
        explanation:
          'Present perfect uses "have/has + past participle". "been" is the past participle of "be".',
        points: 1,
      },
      {
        questionText: 'What does "FYI" stand for in professional communication?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'For Your Instruction', isCorrect: false },
          { text: 'For Your Information', isCorrect: true },
          { text: 'From Your Institution', isCorrect: false },
          { text: 'For Yesterday\'s Issue', isCorrect: false },
        ],
        explanation: '"FYI" stands for "For Your Information" — commonly used in emails and messages.',
        points: 1,
      },
      {
        questionText: '"Effect" is always a verb in English.',
        questionType: QuestionType.TRUE_FALSE,
        options: [
          { text: 'True', isCorrect: false },
          { text: 'False', isCorrect: true },
        ],
        explanation:
          '"Effect" is most commonly a noun (the effect). "Affect" is typically the verb. Though "effect" can rarely be used as a verb meaning "to bring about".',
        points: 1,
      },
      {
        questionText: 'Choose the correct word: "The team needs to _____ a decision."',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'do', isCorrect: false },
          { text: 'make', isCorrect: true },
          { text: 'take', isCorrect: false },
          { text: 'have', isCorrect: false },
        ],
        explanation: 'The correct collocation is "make a decision" in English.',
        points: 1,
      },
    ],
  },

  // ─── React Intermediate ───────────────────────────────────────────────────
  {
    title: 'React.js Essentials',
    description:
      'Test your React knowledge including components, hooks, state management, and component lifecycle.',
    skillName: 'React',
    difficulty: AssessmentDifficulty.INTERMEDIATE,
    duration: 20,
    passingScore: 70,
    questions: [
      {
        questionText: 'What hook is used to manage state in a functional component?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'useEffect', isCorrect: false },
          { text: 'useState', isCorrect: true },
          { text: 'useRef', isCorrect: false },
          { text: 'useMemo', isCorrect: false },
        ],
        explanation: '`useState` returns a state variable and a setter function for managing state.',
        points: 1,
      },
      {
        questionText: 'What is the purpose of the `key` prop when rendering lists?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'Styling the list items', isCorrect: false },
          { text: 'Helping React identify which items changed, added, or removed', isCorrect: true },
          { text: 'Sorting the list', isCorrect: false },
          { text: 'Preventing re-renders', isCorrect: false },
        ],
        explanation:
          'Keys help React identify which items in a list have changed for efficient DOM updates (reconciliation).',
        points: 1,
      },
      {
        questionText: '`useEffect` with an empty dependency array `[]` runs on every render.',
        questionType: QuestionType.TRUE_FALSE,
        options: [
          { text: 'True', isCorrect: false },
          { text: 'False', isCorrect: true },
        ],
        explanation:
          'An empty dependency array means the effect runs only once after the initial render (mount), not on every render.',
        points: 1,
      },
      {
        questionText: 'What does `useMemo` do?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'Memoizes a callback function', isCorrect: false },
          { text: 'Memoizes a computed value', isCorrect: true },
          { text: 'Creates a persistent ref', isCorrect: false },
          { text: 'Manages side effects', isCorrect: false },
        ],
        explanation:
          '`useMemo` memoizes the result of a computation and only recalculates when dependencies change.',
        points: 1,
      },
      {
        questionText: 'What will this component render?',
        questionType: QuestionType.CODE_SNIPPET,
        codeSnippet: `function App() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Clicked {count} times
    </button>
  );
}`,
        options: [
          { text: 'A button showing "Clicked 0 times" that increments on click', isCorrect: true },
          { text: 'A button that always shows "Clicked 0 times"', isCorrect: false },
          { text: 'Nothing, it will error', isCorrect: false },
          { text: 'A button showing "Clicked 1 times"', isCorrect: false },
        ],
        explanation:
          'Initial state is 0 shown as "Clicked 0 times". Each click uses functional update `c => c + 1` to increment.',
        points: 2,
      },
      {
        questionText: 'Which hook should you use to avoid re-creating a callback on every render?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'useState', isCorrect: false },
          { text: 'useEffect', isCorrect: false },
          { text: 'useCallback', isCorrect: true },
          { text: 'useReducer', isCorrect: false },
        ],
        explanation:
          '`useCallback` memoizes a callback function so it only changes when its dependencies change.',
        points: 1,
      },
      {
        questionText: 'React components must return a single root element.',
        questionType: QuestionType.TRUE_FALSE,
        options: [
          { text: 'True', isCorrect: true },
          { text: 'False', isCorrect: false },
        ],
        explanation:
          'Components must return one root element. You can use a Fragment (<> </>) to wrap multiple elements without adding extra DOM nodes.',
        points: 1,
      },
      {
        questionText: 'What is "lifting state up" in React?',
        questionType: QuestionType.MULTIPLE_CHOICE,
        options: [
          { text: 'Moving state to a global store', isCorrect: false },
          { text: 'Moving state to a common ancestor of components that need it', isCorrect: true },
          { text: 'Using useRef instead of useState', isCorrect: false },
          { text: 'Storing state in localStorage', isCorrect: false },
        ],
        explanation:
          'Lifting state up means moving shared state to the closest common parent and passing it down as props.',
        points: 1,
      },
    ],
  },
];

async function seed() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI env variable is required');
    process.exit(1);
  }

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  for (const data of assessments) {
    // Find or create skill
    let skill = await Skill.findOne({
      name: { $regex: new RegExp(`^${data.skillName}$`, 'i') },
    });
    if (!skill) {
      skill = await Skill.create({
        name: data.skillName,
        slug: generateSlug(data.skillName),
        category: 'Technology',
      });
      console.log(`  Created skill: ${data.skillName}`);
    }

    // Check if assessment already exists
    const existing = await Assessment.findOne({
      skillName: data.skillName,
      difficulty: data.difficulty,
      title: data.title,
    });
    if (existing) {
      console.log(`  Skipped (exists): ${data.title}`);
      continue;
    }

    const totalPoints = data.questions.reduce((sum, q) => sum + q.points, 0);

    await Assessment.create({
      ...data,
      slug: generateSlug(data.title),
      skill: skill._id,
      totalPoints,
    });

    console.log(`  Created: ${data.title} (${totalPoints} points)`);
  }

  console.log('\nSeed complete!');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
