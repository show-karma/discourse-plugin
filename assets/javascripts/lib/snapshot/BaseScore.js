export class BaseScore {
  proposal = { choices: [] };
  votes = [];
  strategies = [];
  selected = [];

  constructor(
    proposal = { choices: [] },
    votes = [],
    strategies = [],
    selected = []
  ) {
    this.proposal = proposal;
    this.votes = votes;
    this.strategies = strategies;
    this.selected = selected;
  }
}
