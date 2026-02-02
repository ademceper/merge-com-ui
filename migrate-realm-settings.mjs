import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const files = execSync('grep -rl "@patternfly" apps/auth/src/admin/realm-settings/', { encoding: 'utf-8' })
  .trim().split('\n').filter(Boolean);

console.log(`Found ${files.length} files to migrate`);

for (const file of files) {
  let content = readFileSync(file, 'utf-8');
  const original = content;

  // Remove all @patternfly import blocks (shared/@patternfly/react-core and shared/@patternfly/react-icons)
  // First, collect what's imported from @patternfly
  const pfCoreImports = [];
  const pfIconImports = [];

  // Match multi-line imports from shared/@patternfly/react-core
  content = content.replace(/import\s*\{([^}]+)\}\s*from\s*["'][^"']*\/@patternfly\/react-core["'];?\n?/gs, (match, imports) => {
    pfCoreImports.push(...imports.split(',').map(s => s.trim()).filter(Boolean));
    return '';
  });

  // Match multi-line imports from shared/@patternfly/react-icons
  content = content.replace(/import\s*\{([^}]+)\}\s*from\s*["'][^"']*\/@patternfly\/react-icons["'];?\n?/gs, (match, imports) => {
    pfIconImports.push(...imports.split(',').map(s => s.trim()).filter(Boolean));
    return '';
  });

  if (pfCoreImports.length === 0 && pfIconImports.length === 0) {
    continue;
  }

  // Determine the relative path depth for shared imports
  const depth = file.split('/').length - 'apps/auth/src/admin/realm-settings/'.split('/').filter(Boolean).length;
  // All files are at least 1 level deep from realm-settings
  const sharedPrefix = file.includes('/realm-settings/') ?
    '../'.repeat(file.split('realm-settings/')[1].split('/').length - 1) + '../../shared/keycloak-ui-shared' :
    '../../shared/keycloak-ui-shared';

  // Calculate actual relative path
  const parts = file.replace('apps/auth/src/admin/realm-settings/', '').split('/');
  const subdirDepth = parts.length - 1; // how many subdirectories deep
  const relPrefix = subdirDepth > 0 ? '../'.repeat(subdirDepth) + '../../' : '../../';
  const sharedPath = relPrefix + 'shared/keycloak-ui-shared';

  // Build new imports
  const newImports = [];
  const needsFromShared = [];

  // Components that should come from @merge/ui
  const mergeUiMappings = {
    'Button': '@merge/ui/components/button',
    'ButtonVariant': null, // just remove, use string literals
    'Alert': '@merge/ui/components/alert',
    'AlertDescription': '@merge/ui/components/alert',
    'AlertTitle': '@merge/ui/components/alert',
    'Switch': '@merge/ui/components/switch',
    'Label': '@merge/ui/components/label',
    'Badge': '@merge/ui/components/badge',
    'Tooltip': '@merge/ui/components/tooltip',
    'TooltipContent': '@merge/ui/components/tooltip',
    'TooltipTrigger': '@merge/ui/components/tooltip',
    'TooltipProvider': '@merge/ui/components/tooltip',
    'Popover': '@merge/ui/components/popover',
    'PopoverContent': '@merge/ui/components/popover',
    'PopoverTrigger': '@merge/ui/components/popover',
    'TextInput': '@merge/ui/components/input',
    'TextArea': '@merge/ui/components/textarea',
    'Checkbox': '@merge/ui/components/checkbox',
    'Radio': '@merge/ui/components/radio-group',
    'RadioGroup': '@merge/ui/components/radio-group',
    'RadioGroupItem': '@merge/ui/components/radio-group',
    'Card': '@merge/ui/components/card',
    'CardHeader': '@merge/ui/components/card',
    'CardBody': '@merge/ui/components/card',
    'CardFooter': '@merge/ui/components/card',
    'CardTitle': '@merge/ui/components/card',
    'Spinner': '@merge/ui/components/spinner',
    'Divider': '@merge/ui/components/separator',
    'Dropdown': '@merge/ui/components/dropdown-menu',
    'DropdownItem': '@merge/ui/components/dropdown-menu',
    'DropdownList': '@merge/ui/components/dropdown-menu',
    'MenuToggle': '@merge/ui/components/dropdown-menu',
    'SearchInput': '@merge/ui/components/input',
  };

  // Components that map to shared/keycloak-ui-shared
  const sharedMappings = ['AlertVariant', 'ValidatedOptions'];

  // Components that become simple HTML with Tailwind (no import needed)
  const htmlComponents = [
    'PageSection', 'Flex', 'FlexItem', 'Grid', 'GridItem',
    'Split', 'SplitItem', 'Stack', 'StackItem', 'Gallery', 'GalleryItem',
    'ToolbarItem', 'Text', 'TextContent', 'Title', 'TextVariants',
    'Form', 'FormGroup', 'ActionGroup', 'ActionListItem',
    'List', 'ListItem', 'EmptyState', 'EmptyStateBody', 'EmptyStateIcon',
    'FormHelperText', 'HelperText', 'HelperTextItem',
    'NumberInput', 'SelectOption', 'ExpandableSection',
    'DataList', 'DataListItem', 'DataListItemRow', 'DataListItemCells', 'DataListCell',
    'ClipboardCopy', 'Tab', 'Tabs', 'TabTitleText',
    'AlertActionLink',
    'Modal', 'ModalVariant',
  ];

  // Icon mappings
  const iconMappings = {
    'PlusIcon': 'Plus',
    'PlusCircleIcon': 'PlusCircle',
    'TrashIcon': 'Trash',
    'TimesIcon': 'X',
    'MinusCircleIcon': 'MinusCircle',
    'PencilAltIcon': 'PencilSimple',
    'SearchIcon': 'MagnifyingGlass',
    'FilterIcon': 'Funnel',
    'CheckIcon': 'Check',
    'InfoCircleIcon': 'Info',
    'QuestionCircleIcon': 'Question',
    'ExternalLinkAltIcon': 'ArrowSquareOut',
    'EllipsisVIcon': 'DotsThreeVertical',
    'AngleRightIcon': 'CaretRight',
    'ArrowRightIcon': 'ArrowRight',
    'CaretDownIcon': 'CaretDown',
    'CogIcon': 'Gear',
    'CubesIcon': 'Cube',
    'GlobeRouteIcon': 'Globe',
    'BellIcon': 'Bell',
    'WrenchIcon': 'Wrench',
    'SyncAltIcon': 'ArrowsClockwise',
    'CopyIcon': 'Copy',
  };

  // Group merge/ui imports by path
  const mergeImports = {};
  const iconImportNames = [];

  for (const imp of pfCoreImports) {
    const clean = imp.trim();
    if (!clean) continue;

    if (mergeUiMappings[clean] !== undefined) {
      if (mergeUiMappings[clean] === null) continue; // skip ButtonVariant etc
      const path = mergeUiMappings[clean];
      if (!mergeImports[path]) mergeImports[path] = new Set();
      // Rename TextInput -> Input, TextArea -> Textarea, Divider -> Separator
      if (clean === 'TextInput') mergeImports[path].add('Input');
      else if (clean === 'TextArea') mergeImports[path].add('Textarea');
      else if (clean === 'Divider') mergeImports[path].add('Separator');
      else if (clean === 'Dropdown') {
        if (!mergeImports['@merge/ui/components/dropdown-menu']) mergeImports['@merge/ui/components/dropdown-menu'] = new Set();
        mergeImports['@merge/ui/components/dropdown-menu'].add('DropdownMenu');
        mergeImports['@merge/ui/components/dropdown-menu'].add('DropdownMenuContent');
        mergeImports['@merge/ui/components/dropdown-menu'].add('DropdownMenuItem');
        mergeImports['@merge/ui/components/dropdown-menu'].add('DropdownMenuTrigger');
      }
      else if (clean === 'DropdownItem' || clean === 'DropdownList' || clean === 'MenuToggle') {
        // Already handled by Dropdown above or not needed
      }
      else if (clean === 'Radio') {
        mergeImports[path].add('RadioGroup');
        mergeImports[path].add('RadioGroupItem');
      }
      else if (clean === 'CardBody') mergeImports[path].add('CardContent');
      else mergeImports[path].add(clean);
    } else if (sharedMappings.includes(clean)) {
      needsFromShared.push(clean);
    }
    // htmlComponents are intentionally not imported - they just become divs
  }

  for (const imp of pfIconImports) {
    const clean = imp.trim();
    if (iconMappings[clean]) {
      iconImportNames.push(iconMappings[clean]);
    }
  }

  // Build import statements
  const importLines = [];

  for (const [path, names] of Object.entries(mergeImports)) {
    if (names.size > 0) {
      importLines.push(`import { ${[...names].join(', ')} } from "${path}";`);
    }
  }

  if (iconImportNames.length > 0) {
    importLines.push(`import { ${iconImportNames.join(', ')} } from "@phosphor-icons/react";`);
  }

  // Check if we need to add AlertVariant to existing shared import
  if (needsFromShared.length > 0) {
    // Check if there's already an import from shared/keycloak-ui-shared
    const sharedImportRegex = new RegExp(`(import\\s*\\{[^}]+)\\}\\s*from\\s*["']([^"']*keycloak-ui-shared)["']`);
    const match = content.match(sharedImportRegex);
    if (match) {
      // Check if AlertVariant already exists in the import
      for (const item of needsFromShared) {
        if (!match[1].includes(item)) {
          content = content.replace(match[0], match[0].replace(match[1], match[1] + `,\n    ${item}`));
        }
      }
    } else {
      // Add new shared import
      importLines.push(`import { ${needsFromShared.join(', ')} } from "${sharedPath}";`);
    }
  }

  // Insert new imports after the last existing import
  if (importLines.length > 0) {
    // Find the first import statement to insert after the header
    const firstImportIdx = content.search(/^import\s/m);
    if (firstImportIdx !== -1) {
      content = content.slice(0, firstImportIdx) + importLines.join('\n') + '\n' + content.slice(firstImportIdx);
    }
  }

  // Now do JSX replacements in bulk

  // PageSection -> div with p-6
  content = content.replace(/<PageSection[^>]*variant="light"[^>]*>/g, '<div className="p-6">');
  content = content.replace(/<PageSection[^>]*>/g, '<div className="p-6">');
  content = content.replace(/<\/PageSection>/g, '</div>');

  // Title -> h1/h2/etc
  content = content.replace(/<Title\s+headingLevel="h(\d)"[^>]*>/g, '<h$1 className="text-lg font-semibold">');
  content = content.replace(/<\/Title>/g, '</h$1>');
  // Fix generic Title close tags
  content = content.replace(/<\/h\$1>/g, '</h1>');

  // Text with component -> appropriate element
  content = content.replace(/<Text\s[^>]*component=\{TextVariants\.h1\}[^>]*>/g, '<h1 className="text-xl font-semibold">');
  content = content.replace(/<Text\s[^>]*component=\{TextVariants\.h2\}[^>]*>/g, '<h2 className="text-lg font-semibold">');
  content = content.replace(/<Text\s[^>]*component=\{TextVariants\.h6\}[^>]*>/g, '<h6 className="text-sm font-semibold">');
  content = content.replace(/<\/Text>/g, '</p>');
  content = content.replace(/<Text\b[^>]*>/g, '<p>');

  // TextContent -> div
  content = content.replace(/<TextContent[^>]*>/g, '<div>');
  content = content.replace(/<\/TextContent>/g, '</div>');

  // Flex/FlexItem -> divs
  content = content.replace(/<Flex[^>]*>/g, '<div className="flex gap-2">');
  content = content.replace(/<\/Flex>/g, '</div>');
  content = content.replace(/<FlexItem[^>]*align=\{\{[^}]*alignRight[^}]*\}\}[^>]*>/g, '<div className="ml-auto">');
  content = content.replace(/<FlexItem[^>]*>/g, '<div>');
  content = content.replace(/<\/FlexItem>/g, '</div>');

  // Stack/StackItem -> flex col
  content = content.replace(/<Stack[^>]*>/g, '<div className="flex flex-col gap-2">');
  content = content.replace(/<\/Stack>/g, '</div>');
  content = content.replace(/<StackItem[^>]*>/g, '<div>');
  content = content.replace(/<\/StackItem>/g, '</div>');

  // ToolbarItem -> div
  content = content.replace(/<ToolbarItem[^>]*>/g, '<div>');
  content = content.replace(/<\/ToolbarItem>/g, '</div>');

  // FormGroup -> div with space-y-2
  content = content.replace(/<FormGroup[^>]*>/g, '<div className="space-y-2">');
  content = content.replace(/<\/FormGroup>/g, '</div>');

  // ActionGroup -> flex gap
  content = content.replace(/<ActionGroup[^>]*>/g, '<div className="flex gap-2">');
  content = content.replace(/<\/ActionGroup>/g, '</div>');

  // ActionListItem -> div
  content = content.replace(/<ActionListItem[^>]*>/g, '<div>');
  content = content.replace(/<\/ActionListItem>/g, '</div>');

  // FormHelperText/HelperText/HelperTextItem -> p
  content = content.replace(/<FormHelperText[^>]*>/g, '');
  content = content.replace(/<\/FormHelperText>/g, '');
  content = content.replace(/<HelperText[^>]*>/g, '');
  content = content.replace(/<\/HelperText>/g, '');
  content = content.replace(/<HelperTextItem[^>]*>/g, '<p className="text-sm text-muted-foreground">');
  content = content.replace(/<\/HelperTextItem>/g, '</p>');

  // Divider -> Separator (already imported)
  content = content.replace(/<Divider[^/]*\/>/g, '<Separator />');
  content = content.replace(/<Divider[^>]*>/g, '<Separator>');
  content = content.replace(/<\/Divider>/g, '</Separator>');

  // Button variant replacements
  content = content.replace(/variant=\{ButtonVariant\.primary\}/g, '');
  content = content.replace(/variant=\{ButtonVariant\.secondary\}/g, 'variant="secondary"');
  content = content.replace(/variant=\{ButtonVariant\.link\}/g, 'variant="link"');
  content = content.replace(/variant=\{ButtonVariant\.danger\}/g, 'variant="destructive"');
  content = content.replace(/variant="primary"/g, '');
  content = content.replace(/continueButtonVariant:\s*ButtonVariant\.danger/g, 'continueButtonVariant: "danger"');

  // Button isDisabled -> disabled
  content = content.replace(/isDisabled=/g, 'disabled=');
  // Button isLoading -> just keep it (custom handling)

  // Switch: isChecked -> checked, onChange -> onCheckedChange
  // This is tricky as we can't blindly replace onChange for all components
  // Let's be more targeted

  // NumberInput -> Input type="number"
  content = content.replace(/<NumberInput\b/g, '<Input type="number"');

  // TextInput -> Input
  content = content.replace(/<TextInput\b/g, '<Input');
  content = content.replace(/<\/TextInput>/g, '</Input>');

  // TextArea -> Textarea
  content = content.replace(/<TextArea\b/g, '<Textarea');
  content = content.replace(/<\/TextArea>/g, '</Textarea>');

  // DataList -> simple list
  content = content.replace(/<DataList[^>]*>/g, '<ul className="divide-y">');
  content = content.replace(/<\/DataList>/g, '</ul>');
  content = content.replace(/<DataListItem[^>]*>/g, '<li className="py-2">');
  content = content.replace(/<\/DataListItem>/g, '</li>');
  content = content.replace(/<DataListItemRow[^>]*>/g, '<div className="flex items-center">');
  content = content.replace(/<\/DataListItemRow>/g, '</div>');
  content = content.replace(/<DataListItemCells[\s\S]*?dataListCells=\{?\[?/g, '<div className="flex items-center gap-2">');
  content = content.replace(/<\/DataListItemCells>/g, '</div>');
  content = content.replace(/<DataListCell[^>]*>/g, '<div>');
  content = content.replace(/<\/DataListCell>/g, '</div>');

  // Icon replacements
  for (const [pf, phosphor] of Object.entries(iconMappings)) {
    const regex = new RegExp(`<${pf}\\b`, 'g');
    content = content.replace(regex, `<${phosphor} className="size-4"`);
    const closeRegex = new RegExp(`</${pf}>`, 'g');
    content = content.replace(closeRegex, `/>`);
    // Self-closing
    const selfClose = new RegExp(`<${pf}\\s*/\\s*>`, 'g');
    content = content.replace(selfClose, `<${phosphor} className="size-4" />`);
  }

  // Label (PF) -> Badge or keep as Label depending on context
  // PF Label with color="blue" -> Badge variant="secondary"
  content = content.replace(/<Label\s+color="blue">/g, '<Badge variant="secondary">');
  content = content.replace(/<\/Label>/g, '</Badge>');

  // ClipboardCopy -> simple div (already handled in manual files)

  // SelectOption -> option
  content = content.replace(/<SelectOption\b/g, '<option');
  content = content.replace(/<\/SelectOption>/g, '</option>');

  // Dropdown/DropdownList/MenuToggle - these need manual review, just clean up
  // ExpandableSection -> Collapsible

  // Remove unused variable references
  content = content.replace(/\bTextVariants\b/g, '""');

  // Clean up double blank lines
  content = content.replace(/\n{3,}/g, '\n\n');

  if (content !== original) {
    writeFileSync(file, content);
    console.log(`Migrated: ${file}`);
  } else {
    console.log(`No changes: ${file}`);
  }
}

console.log('Done!');
