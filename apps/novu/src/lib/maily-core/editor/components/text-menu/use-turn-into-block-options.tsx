/* cspell:ignore Pilcrow */
import { Editor, useEditorState } from '@tiptap/react';
import { Footprints, TextH, TextHTwo, TextHThree, List, ListNumbers, Paragraph } from '@phosphor-icons/react'
import type { Icon as LucideIcon } from '@phosphor-icons/react';;

export type TurnIntoBlockOptions = {
  label: string;
  id: string;
  type: 'option';
  disabled: () => boolean;
  isActive: () => boolean;
  onClick: () => void;
  icon: LucideIcon;
};

export type TurnIntoBlockCategory = {
  label: string;
  id: string;
  type: 'category';
};

export type TurnIntoOptions = Array<TurnIntoBlockOptions | TurnIntoBlockCategory>;

export function useTurnIntoBlockOptions(editor: Editor) {
  return useEditorState({
    editor,
    selector: ({ editor }): TurnIntoOptions => [
      {
        type: 'category',
        label: 'Hierarchy',
        id: 'hierarchy',
      },
      {
        icon: Paragraph,
        onClick: () => editor.chain().focus().liftListItem('listItem').setParagraph().run(),
        id: 'paragraph',
        disabled: () => !editor.can().setParagraph(),
        isActive: () =>
          editor.isActive('paragraph') &&
          !editor.isActive('orderedList') &&
          !editor.isActive('bulletList') &&
          !editor.isActive('taskList'),
        label: 'Paragraph',
        type: 'option',
      },
      {
        icon: TextH,
        onClick: () => editor.chain().focus().liftListItem('listItem').setHeading({ level: 1 }).run(),
        id: 'heading1',
        disabled: () => !editor.can().setHeading({ level: 1 }),
        isActive: () => editor.isActive('heading', { level: 1 }),
        label: 'Heading 1',
        type: 'option',
      },
      {
        icon: TextHTwo,
        onClick: () => editor.chain().focus().liftListItem('listItem').setHeading({ level: 2 }).run(),
        id: 'heading2',
        disabled: () => !editor.can().setHeading({ level: 2 }),
        isActive: () => editor.isActive('heading', { level: 2 }),
        label: 'Heading 2',
        type: 'option',
      },
      {
        icon: TextHThree,
        onClick: () => editor.chain().focus().liftListItem('listItem').setHeading({ level: 3 }).run(),
        id: 'heading3',
        disabled: () => !editor.can().setHeading({ level: 3 }),
        isActive: () => editor.isActive('heading', { level: 3 }),
        label: 'Heading 3',
        type: 'option',
      },
      {
        id: 'footer',
        type: 'option',
        label: 'Footer',
        icon: Footprints,
        onClick: () => {
          editor.chain().focus().liftListItem('listItem').setFooter().run();
        },
        disabled: () => !editor.can().setFooter(),
        isActive: () => editor.isActive('footer'),
      },
      {
        type: 'category',
        label: 'Lists',
        id: 'lists',
      },
      {
        icon: List,
        onClick: () => editor.chain().focus().toggleBulletList().run(),
        id: 'bulletList',
        disabled: () => !editor.can().toggleBulletList(),
        isActive: () => editor.isActive('bulletList'),
        label: 'Bullet list',
        type: 'option',
      },
      {
        icon: ListNumbers,
        onClick: () => editor.chain().focus().toggleOrderedList().run(),
        id: 'orderedList',
        disabled: () => !editor.can().toggleOrderedList(),
        isActive: () => editor.isActive('orderedList'),
        label: 'Numbered list',
        type: 'option',
      },
    ],
  });
}
