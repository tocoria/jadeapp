import { CustomerCategory, ProcedureCategory } from '@/components/CategorySelector'

export interface Procedure {
  id: string;
  name: string;
}

export interface Promotion {
  id: string;
  name: string;
  price: number;
  applicableCategories: CustomerCategory[];
  restrictedCommissionCategories?: ProcedureCategory[];
} 