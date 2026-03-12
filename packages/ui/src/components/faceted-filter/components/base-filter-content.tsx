"use client"

import { SizeType } from "../types"
import { ClearButton } from "./clear-button"
import { FilterInput } from "./filter-input"
import { ArrowDown, ArrowUp, ArrowBendDownLeft } from "@phosphor-icons/react"

interface BaseFilterContentProps {
  inputRef: React.RefObject<HTMLInputElement | null>
  title?: string
  onClear: () => void
  size: SizeType
  hideSearch?: boolean
  hideClear?: boolean
  searchValue?: string
  onSearchChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  searchPlaceholder?: string
  showNavigationFooter?: boolean
  showEnterIcon?: boolean
  children?: React.ReactNode
}

export function BaseFilterContent({
  inputRef,
  title,
  onClear,
  size,
  hideSearch = false,
  hideClear = false,
  searchValue = "",
  onSearchChange,
  searchPlaceholder,
  showNavigationFooter = false,
  showEnterIcon = false,
  children,
}: BaseFilterContentProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex w-full items-center justify-between border-b border-neutral-100 bg-neutral-50 px-2.5 py-1.5 dark:border-neutral-700 dark:bg-neutral-800">
        {title && (
          <div className="text-[10px] font-medium uppercase leading-4 text-neutral-400 dark:text-neutral-500">
            {title}
          </div>
        )}
        {!hideClear && (
          <ClearButton onClick={onClear} className="h-4" label="Reset" />
        )}
      </div>

      {!hideSearch && onSearchChange && (
        <FilterInput
          inputRef={inputRef}
          value={searchValue}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          size={size}
          showEnterIcon={showEnterIcon}
        />
      )}

      <div className="max-h-[160px] overflow-y-auto">{children}</div>

      {showNavigationFooter && (
        <div className="flex justify-between rounded-b-md border-t border-neutral-100 bg-white p-1 dark:border-neutral-700 dark:bg-neutral-900">
          <div className="flex items-center gap-0.5">
            <div className="pointer-events-none shrink-0 rounded-[6px] border border-neutral-200 bg-white p-1 shadow-[0px_0px_0px_1px_rgba(14,18,27,0.02)_inset,0px_1px_4px_0px_rgba(14,18,27,0.12)] dark:border-neutral-700 dark:bg-neutral-800">
              <ArrowUp className="h-3 w-3 text-neutral-400 dark:text-neutral-500" />
            </div>
            <div className="pointer-events-none shrink-0 rounded-[6px] border border-neutral-200 bg-white p-1 shadow-[0px_0px_0px_1px_rgba(14,18,27,0.02)_inset,0px_1px_4px_0px_rgba(14,18,27,0.12)] dark:border-neutral-700 dark:bg-neutral-800">
              <ArrowDown className="h-3 w-3 text-neutral-400 dark:text-neutral-500" />
            </div>
            <span className="ml-1.5 text-xs font-normal text-neutral-500">
              Navigate
            </span>
          </div>
          <div className="pointer-events-none shrink-0 rounded-[6px] border border-neutral-200 bg-white p-1 shadow-[0px_0px_0px_1px_rgba(14,18,27,0.02)_inset,0px_1px_4px_0px_rgba(14,18,27,0.12)] dark:border-neutral-700 dark:bg-neutral-800">
            <ArrowBendDownLeft className="h-3 w-3 text-neutral-400 dark:text-neutral-500" />
          </div>
        </div>
      )}
    </div>
  )
}
