import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";

interface ButtonProps {
  oauthType: "google" | "github";
  icon?: IconDefinition;
  text: string;
  type: "submit" | "reset" | "button" | undefined;
  handleClick?: () => void;
}

export default function Button({
  text,
  type,
  handleClick,
  icon,
  oauthType,
}: ButtonProps) {
  return (
    <div>
      <button
        onClick={handleClick}
        type={type}
        className={`relative flex items-center justify-center w-full mt-0 rounded border bg-tertiary border-tertiaryBorder 
         px-3 py-3 text-sm leading-6 text-white shadow-sm hover:brightness-125 transition duration-300 ease-in-out`}
      >
        {icon && (
          <FontAwesomeIcon
            icon={icon}
            className="absolute left-20 text-accent text-xl" // Icon is positioned and sized
          />
        )}
        <span className="flex items-center text-accent font-medium justify-center w-full">
          {text}
        </span>
      </button>
    </div>
  );
}
