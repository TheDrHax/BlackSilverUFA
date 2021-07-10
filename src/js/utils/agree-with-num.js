export default function agreeWithNum(number, word, endings) {
  if (number >= 20) {
    number %= 10;
  }

  if (number === 1) {
    return word + endings[0];
  }

  if (number > 1 && number < 5) {
    return word + endings[1];
  }

  if (number === 0 || number >= 5) {
    return word + endings[2];
  }

  throw new Error('WTF');
}
