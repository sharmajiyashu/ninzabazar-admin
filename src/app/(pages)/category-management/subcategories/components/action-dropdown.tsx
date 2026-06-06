'use client';

import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { SubCategory } from '../page';

interface Props {
  subcategory: SubCategory;
  onEdit: () => void;
  onDelete: () => void;
}

export default function ActionDropdown({ subcategory, onEdit, onDelete }: Props) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors duration-200 outline-none"
        aria-label={`Actions for ${subcategory.name}`}
      >
        <MoreHorizontal size={18} className="text-gray-600" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-1.5 min-w-[160px] z-50 animate-in fade-in zoom-in-95 duration-100"
          sideOffset={5}
          align="end"
        >
          <DropdownMenu.Item
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-green-50 cursor-pointer text-gray-700 text-sm font-medium outline-none transition-colors"
            onSelect={onEdit}
          >
            <Edit size={16} className="text-green-600" />
            Edit
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-gray-100 my-1 mx-2" />

          <DropdownMenu.Item
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 cursor-pointer text-red-600 text-sm font-medium outline-none transition-colors"
            onSelect={onDelete}
          >
            <Trash2 size={16} />
            Delete
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
