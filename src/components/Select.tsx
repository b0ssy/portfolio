import { ChevronDownIcon } from "@heroicons/react/24/outline";

import Button from "./Button";
import Checkbox from "./Checkbox";
import { useClickOutside } from "../lib/hooks";

export interface SelectProps {
  multiple?: boolean;
  options: string[];
  selectedOptions?: string[];
  noOptionsAvailableText?: string;
  onSelected: (selected: string[]) => void;
}

export default function Select(props: SelectProps) {
  const { ref, isActive, setActive } = useClickOutside(false);

  const hasOptions = props.options.length > 0;
  const selectedOptions = props.selectedOptions ?? [];
  return (
    <div ref={ref} className="relative select-none">
      <div
        className={`input flex flex-row items-center ${
          hasOptions ? "cursor-pointer" : ""
        }`}
        onClick={hasOptions ? () => setActive(!isActive) : undefined}
      >
        {!hasOptions && (
          <span className="text text-sm text-disabled h-5">
            {props.noOptionsAvailableText ?? "No options available"}
          </span>
        )}
        <span className="text text-sm h-5">{selectedOptions.join(", ")}</span>
        <div className="flex-grow" />
        <ChevronDownIcon className="w-4 h-4" />
      </div>
      <div className="absolute w-full z-50">
        {isActive && (
          <div className="paper text divider-border flex flex-col mt-2 py-2 select-none">
            {props.options.map((options) => {
              return (
                <Button
                  key={options}
                  variant="text"
                  size="sm"
                  className="flex flex-row items-center gap-4 py-2 text-left rounded-none"
                  onClick={() => {
                    const selected = [...(props.selectedOptions ?? [])];
                    const index = selected.indexOf(options);
                    if (index >= 0) {
                      selected.splice(index, 1);
                    } else {
                      selected.push(options);
                    }
                    props.onSelected(selected);
                  }}
                >
                  {props.multiple && (
                    <Checkbox
                      state={
                        selectedOptions.includes(options)
                          ? "checked"
                          : "unchecked"
                      }
                    />
                  )}
                  {options}
                </Button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
