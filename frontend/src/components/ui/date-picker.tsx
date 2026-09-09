"use client"

import * as React from "react"
import { format, parseISO, isValid } from "date-fns"
import { CalendarIcon, ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "cn"

interface DatePickerProps {
  value?: Date | string;
  onChange?: (date: Date | undefined, dateString: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    if (value instanceof Date) return value;
    const parsed = parseISO(value);
    if (isValid(parsed)) return parsed;
    const newDate = new Date(value);
    return isValid(newDate) ? newDate : undefined;
  }, [value]);

  const handleSelect = (date: Date | undefined) => {
    const formattedStr = date ? format(date, "yyyy-MM-dd") : "";
    onChange?.(date, formattedStr);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            disabled={disabled}
            data-empty={!selectedDate}
            className={cn(
              "w-full justify-between text-left font-normal h-10 px-3 py-2 text-sm shadow-xs border-input bg-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring data-[empty=true]:text-muted-foreground",
              className
            )}
          >
            <span className="flex items-center gap-2 truncate">
              <CalendarIcon className="size-4 text-muted-foreground shrink-0" />
              {selectedDate ? format(selectedDate, "PPP") : <span>{placeholder}</span>}
            </span>
            <ChevronDownIcon className="size-4 text-muted-foreground shrink-0" />
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0 z-50" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          defaultMonth={selectedDate || new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}

export function DatePickerDemo() {
  const [date, setDate] = React.useState<Date>()

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            data-empty={!date}
            className="w-[212px] justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
          >
            {date ? format(date, "PPP") : <span>Pick a date</span>}
            <ChevronDownIcon data-icon="inline-end" />
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0 z-50" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          defaultMonth={date}
        />
      </PopoverContent>
    </Popover>
  )
}
