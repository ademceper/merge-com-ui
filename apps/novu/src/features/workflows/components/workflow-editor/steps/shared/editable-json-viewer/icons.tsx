import {
  CaretDown,
  Check,
  Copy,
  PencilSimple,
  Plus,
  Trash,
  X,
} from '@phosphor-icons/react';

export const JSON_EDITOR_ICONS = {
  add: <Plus className="hover:text-feature size-3 transition-all duration-200 hover:scale-110" />,
  edit: <PencilSimple className="hover:text-feature size-3 transition-all duration-200 hover:scale-110" />,
  delete: <Trash className="hover:text-destructive size-4 transition-all duration-200 hover:scale-110" />,
  copy: <Copy className="hover:text-feature size-3 transition-all duration-200 hover:scale-110" />,
  ok: (
    <Check className="size-4 text-green-500 transition-all duration-200 hover:scale-110 hover:rounded-full hover:bg-green-100 hover:p-0.5" />
  ),
  cancel: (
    <X className="size-4 text-red-500 transition-all duration-200 hover:scale-110 hover:rounded-full hover:bg-red-100 hover:p-0.5" />
  ),
  chevron: <CaretDown className="hover:text-feature size-3 transition-all duration-200 hover:scale-110" />,
};
