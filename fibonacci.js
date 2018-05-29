const d1 = new Date();
for (let i = 0; i < 10; i++) {
  const answer = fibonacci(i, true);
  console.log(i, answer);
}
const d2 = new Date();
console.log('Done in', (d2 - d1) + 'ms');

function fibonacci(idx, useRecursiveMethod) {
  let fibs = [0, 1];
  if (idx < 2) {
    return fibs[idx];
  }

  if (useRecursiveMethod) {
    return fibonacci(idx - 1) + fibonacci(idx - 2);
  }

  for (let i = 2; i <= (idx + 1); i++) {
    fibs.push(fibs[(i - 2)] + fibs[(i - 1)]);
  }
  return fibs[idx];
}
