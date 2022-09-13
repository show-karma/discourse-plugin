export const getVoteBreakdown = (
  votes = [],
  choices = ["For", "Against", "Abstain"]
) => {
  const vb = {};
  choices.forEach((choice) => (vb[choice] = 0));

  votes.forEach((item) => {
    vb[choices[+item.choice - 1]]++;
  });
  vb.total = votes.length;
  return vb;
};
