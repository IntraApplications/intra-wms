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
      <div className=" relative">
        <label className="block text-sm font-medium leading-6 text-neutral">
          {label}
        </label>
        <div className="mt-2">
          <input
            {...inputProps}
            ref={ref}
            className={`block w-full bg-secondary text-neutral border-none rounded-md border-0 p-3.5 shadow-sm ring-1 ring-inset ${
              error
                ? "ring-red-500 focus:ring-red-500"
                : "ring-accent focus:ring-indigo-600"
            } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:outline-none sm:text-sm sm:leading-6`}
          />
        </div>
        <p
          className={`absolute top-full left-0 mt-1 text-sm text-red-500 transition-opacity duration-300 ${
            error ? "opacity-100" : "opacity-0"
          }`}
        >
          {error?.message}
        </p>
      </div>
    );
  }
);

export default Input;
