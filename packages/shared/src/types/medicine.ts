export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  dosageForm: string;
  price?: number;
  isNlem: boolean;
  janAushadhiPrice?: number;
  sideEffects?: string[];
  updatedAt: string;
}
