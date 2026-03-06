
import type { BlockItem } from './types';
import {
  Eraser,
  Footprints,
  LineSegment,
  Quotes,
  TextH,
  TextHThree,
  TextHTwo,
  TextT,
} from '@phosphor-icons/react';

export const text: BlockItem = {
  title: 'TextT',
  description: 'Just start typing with plain text.',
  searchTerms: ['p', 'paragraph'],
  icon: <TextT className="mly-h-4 mly-w-4" />,
  command: ({ editor, range }) => {
    editor.chain().focus().deleteRange(range).toggleNode('paragraph', 'paragraph').run();
  },
};

export const heading1: BlockItem = {
  title: 'Heading 1',
  description: 'Big heading.',
  searchTerms: ['h1', 'title', 'big', 'large'],
  icon: <TextH className="mly-h-4 mly-w-4" />,
  command: ({ editor, range }) => {
    editor.chain().focus().deleteRange(range).setNode('heading', { level: 1 }).run();
  },
};

export const heading2: BlockItem = {
  title: 'Heading 2',
  description: 'Medium heading.',
  searchTerms: ['h2', 'subtitle', 'medium'],
  icon: <TextHTwo className="mly-h-4 mly-w-4" />,
  command: ({ editor, range }) => {
    editor.chain().focus().deleteRange(range).setNode('heading', { level: 2 }).run();
  },
};

export const heading3: BlockItem = {
  title: 'Heading 3',
  description: 'Small heading.',
  searchTerms: ['h3', 'subtitle', 'small'],
  icon: <TextHThree className="mly-h-4 mly-w-4" />,
  command: ({ editor, range }) => {
    editor.chain().focus().deleteRange(range).setNode('heading', { level: 3 }).run();
  },
};

export const hardBreak: BlockItem = {
  title: 'Hard Break',
  description: 'Add a break between lines.',
  searchTerms: ['break', 'line'],
  icon: <LineSegment className="mly-h-4 mly-w-4" />,
  command: ({ editor, range }) => {
    editor.chain().focus().deleteRange(range).setHardBreak().run();
  },
};

export const blockquote: BlockItem = {
  title: 'Blockquote',
  description: 'Add blockquote.',
  searchTerms: ['quote', 'blockquote'],
  icon: <Quotes className="mly-h-4 mly-w-4" />,
  command: ({ editor, range }) => {
    editor.chain().focus().deleteRange(range).toggleBlockquote().run();
  },
};

export const footer: BlockItem = {
  title: 'Footer',
  description: 'Add a footer text to email.',
  searchTerms: ['footer', 'text'],
  icon: <Footprints className="mly-h-4 mly-w-4" />,
  command: ({ editor, range }) => {
    editor.chain().focus().deleteRange(range).setFooter().run();
  },
};

export const clearLine: BlockItem = {
  title: 'Clear Line',
  description: 'Clear the current line.',
  searchTerms: ['clear', 'line'],
  icon: <Eraser className="mly-h-4 mly-w-4" />,
  command: ({ editor, range }) => {
    editor.chain().focus().selectParentNode().deleteSelection().run();
  },
};
