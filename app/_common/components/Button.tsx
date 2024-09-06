import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";

interface ButtonProps {
  oauthType: "google" | "github";
  icon?: IconDefinition;
  text: string;
  type: "submit" | "reset" | "button" | undefined;
  handleClick?: () => void;
  loading?: boolean;
  size?: "xxs" | "xs" | "small" | "medium" | "large"; // Added "xxs" size
}

export default function Button({
  text,
  type,
  handleClick,
  icon,
  oauthType,
  loading = false,
  size = "medium", // Default size
}: ButtonProps) {
  // Define size classes
  const sizeClasses = {
    xxs: "px-3 py-0.5 text-[11px]", // Extra extra small size
    xs: "px-4 py-1 text-[11px]", // Extra small size
    small: "px-3 py-2 text-sm", // Small size
    medium: "px-4 py-3 text-base", // Medium size
    large: "px-6 py-4 text-lg", // Large size
  };

  return (
    <div>
      <button
        onClick={handleClick}
        type={type}
        className={`w-full relative flex items-center justify-center whitespace-nowrap rounded border bg-tertiary border-tertiaryBorder 
         ${sizeClasses[size]} leading-6 text-white shadow-sm hover:brightness-125 transition duration-300 ease-in-out`}
        disabled={loading}
      >
        <span className="flex items-center text-white font-medium justify-center">
          {loading ? (
            <div className="loader-container">
              <div className="loader"></div>
            </div>
          ) : (
            text
          )}
        </span>
        {/* Move icon to the right */}
        {icon && !loading && (
          <FontAwesomeIcon
            icon={icon}
            className={`ml-2 text-tertiaryBorder ${
              size === "xxs"
                ? "text-sm"
                : size === "xs"
                ? "text-base"
                : size === "small"
                ? "text-lg"
                : size === "large"
                ? "text-2xl"
                : "text-xl"
            }`}
          />
        )}
      </button>
    </div>
  );
}
