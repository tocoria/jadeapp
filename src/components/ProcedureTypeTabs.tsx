'use client'

import React from 'react'

export type ProcedureType = 'MAIN' | 'BOTOX' | 'TATTOO' | 'HAIR'

type ProcedureTypeTabsProps = {
  selectedType: ProcedureType;
  onTypeChange: (type: ProcedureType) => void;
  availableTypes: ProcedureType[];
}

export default function ProcedureTypeTabs({ selectedType, onTypeChange, availableTypes }: ProcedureTypeTabsProps) {
  return (
    <div className="flex items-center p-2 rounded-lg">
      <nav className="flex space-x-4" aria-label="Procedure Types">
        {availableTypes.map((type) => (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            className={`
              whitespace-nowrap py-2 px-3 rounded-md text-sm font-medium
              ${selectedType === type
                ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }
            `}
          >
            {type.charAt(0) + type.slice(1).toLowerCase()}
          </button>
        ))}
      </nav>
    </div>
  )
} 