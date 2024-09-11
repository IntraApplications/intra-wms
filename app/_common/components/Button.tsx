import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";

interface ButtonProps {
  oauthType?: "google" | "github";
  icon?: IconDefinition;
  text: string;
  type: "submit" | "reset" | "button" | undefined;
  handleClick?: () => void;
  loading?: boolean;
  size?: "xxs" | "xs" | "normal" | "small" | "medium" | "large";
  colorType?: "primary" | "secondary" | "tertiary" | "success" | "danger"; // Added tertiary
}

export default function Button({
  text,
  type,
  handleClick,
  icon,
  loading = false,
  size = "normal",
  colorType = "primary", // Default colorType is "primary"
}: ButtonProps) {
  // Define size classes
  const sizeClasses = {
    xxs: "px-3 text-[9px]",
    xs: "px-4 text-[10px]",
    small: "px-5 py-0.5 text-xs",
    medium: "px-5 py-2 text-base",
    normal: "px-5 py-3 text-base",
    large: "px-6 py-4 text-lg",
  };

  // Define color classes based on the colorType prop, matching global.css variables
  const colorClasses = {
    primary: "bg-primary text-neutral border-border hover:brightness-125",
    secondary:
      "bg-secondary text-neutral border-secondaryBorder hover:brightness-125",
    tertiary:
      "bg-tertiary text-neutral border-tertiaryBorder hover:brightness-125",
    success: "bg-green-500 text-white border-green-500 hover:brightness-125", // Example success color
    danger: "bg-red-500 text-white border-red-500 hover:brightness-125", // Example danger color
  };

  return (
    <div>
      <button
        onClick={handleClick}
        type={type}
        className={`w-full relative flex items-center justify-center whitespace-nowrap rounded border 
         ${colorClasses[colorType]} ${sizeClasses[size]} leading-6 shadow-sm transition duration-300 ease-in-out`}
        disabled={loading}
      >
        <span className="flex items-center font-medium justify-center">
          {loading ? (
            <div className="loader-container">
              <div className="loader"></div>
            </div>
          ) : (
            text
          )}
        </span>
        {icon && !loading && (
          <FontAwesomeIcon
            icon={icon}
            className={`ml-2 ${
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
