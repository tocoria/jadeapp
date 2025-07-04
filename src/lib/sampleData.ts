import { CustomerCategory, ProcedureCategory } from '@/components/CategorySelector'

interface Promotion {
  id: string
  code: string
  name: string
  price: number
  applicableCategories: CustomerCategory[]
  restrictedCommissionCategories: ProcedureCategory[]
}

export const promotions: Promotion[] = [
  {
    id: '1',
    code: 'PROMOTH',
    name: 'Monthly Thermage Special',
    price: 1800000,
    applicableCategories: ['K0', 'K20', 'K30'],
    restrictedCommissionCategories: ['커3']
  },
  {
    id: '2',
    code: 'PROPACK',
    name: 'Laser Package Deal',
    price: 800000,
    applicableCategories: ['K20', 'K30'],
    restrictedCommissionCategories: ['커2', '커3']
  },
  {
    id: '3',
    code: 'PROBOTX',
    name: 'Botox Bundle',
    price: 350000,
    applicableCategories: ['K0', 'K20', 'K30'],
    restrictedCommissionCategories: []
  }
] 