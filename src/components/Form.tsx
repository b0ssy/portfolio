import { useState } from "react";

import Button, { ButtonProps } from "./Button";
import Checkbox from "./Checkbox";
import Select, { SelectProps } from "./Select";
import Spinner from "./Spinner";
import Switch from "./Switch";

export function useForm<T extends string>() {
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState<{ [k in T]?: string | null }>({});
  const [errors, setErrors] = useState<{ [k in T | "execute"]?: string }>({});
  const [loading, setLoading] = useState(false);

  const createTextInput = (props: {
    name: T;
    title: string;
    autoFocus?: boolean;
    type?: React.HTMLInputTypeAttribute;
    disabled?: boolean;
    optional?: boolean;
  }) => (
    <>
      <div className="text-dim text-sm">
        {props.title}
        {props.optional && (
          <span className="text-xs text-disabled"> (optional)</span>
        )}
      </div>
      <div className="h-2" />
      <input
        className={`${!errors[props.name] ? "input" : "input-error"} w-96`}
        type={props.type}
        autoFocus={props.autoFocus}
        disabled={props.disabled || loading}
        value={fields[props.name] ?? ""}
        onClick={() => setErrors({})}
        onChange={(e) => {
          setFields({ ...fields, [props.name]: e.target.value });
        }}
      />
      {!!errors[props.name] && (
        <div className="py-1 text-error text-sm">{errors[props.name]}</div>
      )}
      <div className="h-4" />
    </>
  );

  const createCheckbox = (props: {
    name: T;
    title: string;
    disabled?: boolean;
  }) => (
    <>
      <Checkbox
        state={fields[props.name] ? "checked" : undefined}
        label={props.title}
        disabled={props.disabled}
        onClick={(state) => {
          setFields({
            ...fields,
            [props.name]: state === "checked" ? "checked" : "",
          });
        }}
      />
      <div className="h-2" />
      {!!errors[props.name] && (
        <div className="py-1 text-error text-sm">{errors[props.name]}</div>
      )}
      <div className="h-4" />
    </>
  );

  const createSwitch = (props: { name: T; title: string }) => (
    <>
      <Switch
        checked={!!fields[props.name]}
        label={props.title}
        onChecked={(checked) => {
          setFields({
            ...fields,
            [props.name]: checked ? "checked" : "",
          });
        }}
      />
      <div className="h-2" />
      {!!errors[props.name] && (
        <div className="py-1 text-error text-sm">{errors[props.name]}</div>
      )}
      <div className="h-4" />
    </>
  );

  const createSelect = (props: {
    name: T;
    title: string;
    options: string[];
    optional?: boolean;
    selectProps?: Pick<SelectProps, "noOptionsAvailableText">;
  }) => (
    <>
      <div className="text-dim text-sm">
        {props.title}
        {props.optional && (
          <span className="text-xs text-disabled"> (optional)</span>
        )}
      </div>
      <div className="h-2" />
      <Select
        multiple
        options={props.options}
        selectedOptions={
          fields[props.name] ? fields[props.name]?.split(",") : []
        }
        onSelected={(selected) => {
          setFields({
            ...fields,
            [props.name]: selected.join(","),
          });
        }}
        {...props.selectProps}
      />
      {!!errors[props.name] && (
        <div className="py-1 text-error text-sm">{errors[props.name]}</div>
      )}
      <div className="h-4" />
    </>
  );

  const createActions = (props: {
    buttons: {
      title: string;
      ButtonProps?: ButtonProps;
      onClick: () => void;
    }[];
  }) => (
    <>
      <div className="flex flex-row items-center mt-2 gap-2">
        <div className="flex-grow" />
        {loading && <Spinner />}
        {props.buttons.map((btn) => (
          <Button
            key={btn.title}
            size="sm"
            disabled={loading}
            onClick={btn.onClick}
            {...btn.ButtonProps}
          >
            {btn.title}
          </Button>
        ))}
      </div>
      {!!errors.execute && (
        <div className="pt-2 text-error text-sm text-right">
          {errors.execute}
        </div>
      )}
    </>
  );

  const sleep = async (milliseconds: number) => {
    if (milliseconds > 0) {
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, milliseconds);
      });
    }
  };

  const execute = async <T,>(fn: Promise<T>, milliseconds?: number) => {
    setErrors({});
    setLoading(true);
    const start = Date.now();
    const result = await fn.catch(() => null);
    const duration = Date.now() - start;
    if (milliseconds !== undefined && duration < milliseconds) {
      await sleep(milliseconds - duration);
    }
    setLoading(false);
    return result;
  };

  const clear = () => {
    setOpen(false);
    setFields({});
    setErrors({});
    setLoading(false);
  };

  return {
    open,
    setOpen,
    fields,
    setFields,
    errors,
    setErrors,
    loading,
    setLoading,
    execute,
    clear,
    createTextInput,
    createCheckbox,
    createSwitch,
    createSelect,
    createActions,
  };
}
