import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";

interface ButtonProps {
  oauthType: "google" | "github";
  icon?: IconDefinition;
  text: string;
  type: "submit" | "reset" | "button" | undefined;
  handleClick?: () => void;
  loading?: boolean;
}

export default function Button({
  text,
  type,
  handleClick,
  icon,
  oauthType,
  loading = false,
}: ButtonProps) {
  return (
    <div>
      <button
        onClick={handleClick}
        type={type}
        className={`relative flex items-center justify-center w-full mt-0 rounded border bg-tertiary border-tertiaryBorder 
         px-3 py-3 text-sm leading-6 text-white shadow-sm hover:brightness-125 transition duration-300 ease-in-out`}
        disabled={loading}
      >
        {icon && !loading && (
          <FontAwesomeIcon
            icon={icon}
            className="absolute left-20 text-accent text-xl"
          />
        )}
        <span className="flex items-center text-accent font-medium justify-center w-full">
          {loading ? (
            <div className="loader-container">
              <div className="loader"></div>
            </div>
          ) : (
            text
          )}
        </span>
      </button>
    </div>
  );
}
