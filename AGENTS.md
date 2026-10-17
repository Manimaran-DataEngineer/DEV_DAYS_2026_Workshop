# Dev Days Quiz: Agent Instructions

## Project
- Small quiz web app built with plain HTML, CSS, and JavaScript.
- Run tests with `npm test`.

## Rules
- Do not add frameworks, build tools, or npm dependencies.
- Keep pure quiz logic in `src/quiz.js`; export it with `module.exports` and test it with `node:test`.
- Keep DOM and event code in `src/app.js`; quiz data lives in `src/questions.js`.
- Define CSS colors only as variables in `:root` in `src/style.css`; use those variables elsewhere.
- Use buttons for actions, provide visible keyboard focus, and use `aria-live` for changing messages.