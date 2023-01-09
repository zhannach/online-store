import { arrayRemove } from './utils';

it('Remove item from array', () => {
  const array = [1, 2, 3, 10];
  const item = 1;
  expect(arrayRemove(array, item)).toStrictEqual([2, 3, 10]);
});

it('Remove item from array', () => {
  const array = [6, 2, 3, 10];
  const item = 10;
  expect(arrayRemove(array, item)).toStrictEqual([6, 2, 3]);
});
