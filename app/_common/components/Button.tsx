interface ButtonProps {
  text: string;
  type: "submit" | "reset" | "button" | undefined;
  handleClick?: () => void;
}

export default function Button({ text, type, handleClick }: ButtonProps) {
  return (
   
      <button
        onClick={handleClick}
        type={type}
        className="flex w-full justify-center mt-0 rounded bg-indigo-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        {text}
      </button>
    
  );
}
