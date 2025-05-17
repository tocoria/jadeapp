import { CustomerCategory, ProcedureCategory } from '@/components/CategorySelector'

export interface Procedure {
  id: string;
  code: string;
  name: string;
  prices: {
    K10: number;
    K20: number;
    K30: number;
  };
}

export interface Promotion {
  id: string;
  code: string;
  name: string;
  price: number;
  applicableCategories: CustomerCategory[];
  restrictedCommissionCategories?: ProcedureCategory[];
} 