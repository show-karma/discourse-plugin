declare module "karma-score" {
  declare type FieldType = "text" | "select" | "number" | "string";
  declare interface FormFieldValue {
    label: string;
    type: FieldType;
    postTitle?: string;
    value?: string | string[];
  }
  declare interface CustomField extends FormFieldValue {
    options?: {
      id: string | number;
      value: string;
    };
  }
}
