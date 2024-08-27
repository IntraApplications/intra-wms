import React, { useState } from "react";
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
    const [hasText, setHasText] = useState(!!inputProps.value);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasText(!!e.target.value);
    };

    return (
      <div className="relative">
        <div className="mt-2">
          <input
            {...inputProps}
            ref={ref}
            className={`block w-full bg-secondary text-neutral border-none rounded-md p-5 shadow-sm ring-1 ring-inset ${
              error
                ? "ring-red-500 focus:ring-red-500"
                : "ring-accent focus:ring-indigo-600"
            } focus:ring-2 focus:ring-inset focus:outline-none sm:text-sm sm:leading-6 peer`}
            placeholder=" "
            onChange={handleInputChange}
          />
          <label
            className={`absolute left-3 transition-all duration-200 ease-in-out transform origin-left pointer-events-none text-gray-400 bg-secondary  ${
              hasText
                ? "-top-2 text-xs scale-80 px-3"
                : "top-5 scale-100"
            } peer-focus:-top-2 peer-focus:left-3 peer-focus:text-xs peer-focus:scale-80 px-3`}
          >
            {label}
          </label>
        </div>
        <p
          className={`absolute top-full left-5 mt-2 text-xs text-red-500 transition-opacity duration-600 ${
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
