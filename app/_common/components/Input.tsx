import React from "react";
import { DetailedHTMLProps, InputHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";

type NativeInputProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

type CustomInputProps = {
  label: string;
  error: FieldError | undefined;
};

type InputProps = CustomInputProps & NativeInputProps;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...inputProps }, ref) => {
    return (
      <div className="relative mt-6">
        <label className="block text-sm font-medium text-accent mb-2">
          {label}
        </label>
        <input
          {...inputProps}
          ref={ref}
          className={`block w-full bg-primary text-neutral border border-solid rounded-md p-3 shadow-sm placeholder-secondary ${
            error
              ? "border-red-500 focus:border-red-500 animate-shake"
              : "border-border focus:border-border"
          } focus:outline-none focus:shadow-none hover:brightness-110 transition duration-200 ease-in-out sm:text-sm sm:leading-6`}
        />
        <div className="relative">
          {error && (
            <p className="left-0 top-full mt-1 text-xs text-red-500 animate-slideIn">
              {error.message}
            </p>
          )}
        </div>
      </div>
    );
  }
);
Input.displayName = "Input";
export default Input;
