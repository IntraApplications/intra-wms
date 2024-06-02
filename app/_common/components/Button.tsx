interface ButtonProps {
  text: string;
  handleClick: () => void;
}

export default function Button({ text, handleClick }: ButtonProps) {
  return (
    <div>
      <button
        onClick={handleClick}
        type="submit"
        className="flex w-full justify-center rounded bg-indigo-600 px-3 py-2.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        {text}
      </button>
    </div>
  );
}
