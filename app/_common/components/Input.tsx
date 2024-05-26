import { DetailedHTMLProps, InputHTMLAttributes } from "react";

type NativeInputProps = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

type CustomInputProps = {
  label: string;
};

type InputProps = CustomInputProps & NativeInputProps;

const Input = ({ label, ...inputProps }: InputProps) => {
  return (
    <div>
      <label className="block text-sm font-medium leading-6 text-neutral">
        {label}
      </label>
      <div className="mt-2">
        <input
          {...inputProps}
          className="block w-full bg-secondary text-neutral border-none rounded-md border-0 p-3.5 shadow-sm ring-1 ring-inset ring-accent placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 focus:outline-none sm:text-sm sm:leading-6"
        />
      </div>
    </div>
  );
};

export default Input;
