import React from "react";
import { twMerge } from "tailwind-merge";

export interface ButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  variant?: "text" | "filled" | "outlined";
  size?: "sm" | "md";
  color?: "info" | "success" | "warn" | "error";
}

export default function Button(props: ButtonProps) {
  const classes: string[] = ["select-none"];

  switch (props.variant ?? "filled") {
    case "text":
      classes.push(
        "rounded-full text enabled:hover:text-base-100 enabled:hover:bg-primary-900 enabled:active:bg-primary-700 disabled:text-disabled transition"
      );
      break;
    case "filled":
      classes.push(
        "rounded-full bg-primary-700 text-base-50 enabled:hover:bg-primary-800 enabled:active:bg-primary-700 disabled:text-disabled transition"
      );
      break;
    case "outlined":
      classes.push(
        "rounded-full text ring-1 ring-base-400 dark:ring-base-600 enabled:hover:text-base-100 enabled:hover:bg-primary-900 enabled:active:bg-primary-700 disabled:text-disabled transition"
      );
      break;
    default:
      break;
  }

  switch (props.size ?? "md") {
    case "sm":
      classes.push("px-4 py-2 text-sm");
      break;
    case "md":
      classes.push("px-8 py-3");
      break;
    default:
      break;
  }

  switch (props.color) {
    case "info":
      classes.push(
        "bg-info-500 enabled:hover:bg-info-800 enabled:active:bg-info-700"
      );
      break;
    case "success":
      classes.push(
        "bg-success-500 enabled:hover:bg-success-800 enabled:active:bg-success-700"
      );
      break;
    case "warn":
      classes.push(
        "bg-warn-500 enabled:hover:bg-warn-800 enabled:active:bg-warn-700"
      );
      break;
    case "error":
      classes.push(
        "bg-error-500 enabled:hover:bg-error-800 enabled:active:bg-error-700"
      );
      break;
    default:
      break;
  }

  return (
    <button
      {...props}
      className={twMerge(classes.join(" "), props.className ?? "")}
    >
      {props.children}
    </button>
  );
}
