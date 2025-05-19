export interface Promotion {
  id: string
  code: string
  name: string
  description: string
  price: number
  availableK0: boolean
  availableK20: boolean
  availableK25: boolean
  availableK30?: boolean
  created_at?: string
  updated_at?: string
} 