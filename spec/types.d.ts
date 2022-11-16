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
}
