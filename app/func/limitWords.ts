interface dataLimit {
  sentens: any;
  count: number
}
export const limitWord = ({ sentens, count }: dataLimit) => {
  const countSentens = sentens.split(' ');
  let newSentenses = '';
  if (sentens.split(' ').length > count) {
    const sentenses = countSentens.slice(0, count);
    for (var i = 0; i < sentenses.length; i++) {
      newSentenses += ' ' + countSentens[i];
    }
    return newSentenses += '...';
  } else {
    for (var i = 0; i < countSentens.length; i++) {
      newSentenses += ' ' + countSentens[i];
    }
    return newSentenses
  }
};
