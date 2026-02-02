"use client";

import React from "react";
import countryList from "react-select-country-list";
import { Controller } from "react-hook-form";
import { ChevronsUpDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

const CountrySelectField = ({
  name,
  label,
  control,
  error,
  required = false,
}: CountrySelectProps) => {
  const [open, setOpen] = React.useState(false);
  const options = React.useMemo(() => countryList().getData(), []);

  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="form-label">
        {label}
      </Label>

      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? `Please select ${label.toLowerCase()}` : false,
        }}
        render={({ field }) => (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className={cn(
                  "country-select-trigger",
                  !field.value && "text-gray-500",
                )}
              >
                {field.value
                  ? options.find((option) => option.value === field.value)
                      ?.label
                  : `Select ${label.toLowerCase()}`}
                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 border-gray-600 bg-gray-800 text-white">
              <Command>
                <CommandInput
                  placeholder="Search country..."
                  className="country-select-input"
                />
                <CommandList>
                  <CommandEmpty className="country-select-empty">
                    No country found.
                  </CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={option.value}
                        value={option.label}
                        onSelect={() => {
                          field.onChange(option.value);
                          setOpen(false);
                        }}
                        className="country-select-item"
                      >
                        <Check
                          className={cn(
                            "mr-2 size-4",
                            option.value === field.value
                              ? "opacity-100"
                              : "opacity-0",
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );
};

export default CountrySelectField;
