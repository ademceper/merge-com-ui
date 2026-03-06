/** biome-ignore-all lint/correctness/useHookAtTopLevel: needs to be fixed */
import { BubbleMenu } from '@tiptap/react';

import { sticky } from 'tippy.js';
import { DEFAULT_INLINE_IMAGE_HEIGHT, DEFAULT_INLINE_IMAGE_WIDTH } from '../../nodes/inline-image/inline-image';
import { ImageSize } from '../image-menu/image-size';
import { EditorBubbleMenuProps } from '../text-menu/text-bubble-menu';
import { LinkInputPopover } from '../ui/link-input-popover';
import { TooltipProvider } from '../ui/tooltip';
import { useInlineImageState } from './use-inline-image-state';
import { ImageSquare } from '@phosphor-icons/react';

export function InlineImageBubbleMenu(props: EditorBubbleMenuProps) {
  const { editor, appendTo } = props;
  if (!editor) {
    return null;
  }

  const state = useInlineImageState(editor);

  const bubbleMenuProps: EditorBubbleMenuProps = {
    ...props,
    ...(appendTo ? { appendTo: appendTo.current } : {}),
    shouldShow: ({ editor }) => {
      if (!editor.isEditable || editor.view.dragging) {
        return false;
      }

      return editor.isActive('inlineImage');
    },
    tippyOptions: {
      popperOptions: {
        modifiers: [{ name: 'flip', enabled: false }],
      },
      plugins: [sticky],
      sticky: 'popper',
      maxWidth: '100%',
    },
  };

  return (
    <BubbleMenu
      {...bubbleMenuProps}
      className="mly-flex mly-rounded-lg mly-border mly-border-gray-200 mly-bg-white mly-p-0.5 mly-shadow-md"
    >
      <TooltipProvider>
        <div className="mly-flex mly-space-x-0.5">
          <LinkInputPopover
            defaultValue={state?.src ?? ''}
            onValueChange={(value, isVariable) => {
              editor
                ?.chain()
                .updateInlineImageAttributes({
                  src: value,
                  isSrcVariable: isVariable ?? false,
                })
                .run();
            }}
            tooltip="Source URL"
            icon={ImageSquare}
            editor={editor}
            isVariable={state.isSrcVariable}
          />

          <LinkInputPopover
            defaultValue={state?.imageExternalLink ?? ''}
            onValueChange={(value, isVariable) => {
              editor
                ?.chain()
                .updateInlineImageAttributes({
                  externalLink: value,
                  isExternalLinkVariable: isVariable ?? false,
                })
                .run();
            }}
            tooltip="External URL"
            editor={editor}
            isVariable={state.isExternalLinkVariable}
          />

          <ImageSize
            dimension="height"
            value={state?.height}
            onValueChange={(value) => {
              editor
                ?.chain()
                .updateInlineImageAttributes({
                  width: value || DEFAULT_INLINE_IMAGE_WIDTH,
                  height: value || DEFAULT_INLINE_IMAGE_HEIGHT,
                })
                .run();
            }}
          />
        </div>
      </TooltipProvider>
    </BubbleMenu>
  );
}
