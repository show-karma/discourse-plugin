declare module "karma-score" {
  declare type FieldType = "text" | "select" | "number" | "string";
  declare interface FormFieldValue {
    label: string;
    type: FieldType;
    placeholder?: string;
    postTitle?: string;
    value?: string | string[];
    displayAs?: "headline" | "tag" | "title" | "none";
  }
  declare interface CustomField extends FormFieldValue {
    options?: {
      id: string | number;
      value: string;
    }[];
  }

  declare type ProposalType = "On-chain" | "Off-chain";

  declare interface Proposal {
    id: string;
    type: ProposalType;
    title: string;
    shortname: string;
    voteCount: number;
    voteBreakdown: any;
    endsAt: number;
    voteStarts: number;
    dateDescription: string;
    snapshotId: string;
  }

  declare interface OffChainProposal extends Proposal {
    choices: any[];
    strategies: any[];
    network: string;
    snapshot: string;
    proposalType: string;
  }
}
