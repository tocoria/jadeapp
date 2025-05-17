export interface Promotion {
  id: string
  code: string
  name: string
  description: string
  price: number
  available_k10: boolean
  available_k20: boolean
  created_at?: string
  updated_at?: string
} 