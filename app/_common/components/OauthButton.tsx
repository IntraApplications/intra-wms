import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { redirect } from "next/navigation";
import { createClient } from "@/_lib/supabase/supabase-server";
import { handleOAuth } from "@/(auth)/actions";

interface OauthButtonProps {
  oauthType: "google" | "github";
  icon: IconDefinition;
  text: string;
}

export default function OauthButton({
  text,
  icon,
  oauthType,
}: OauthButtonProps) {
  return (
    <form action={handleOAuth}>
      {/* Hidden input to pass oauthType */}
      <input type="hidden" name="oauthType" value={oauthType} />

      <button
        type="submit"
        className={`relative flex items-center justify-center w-full mt-0 rounded border  ${
          oauthType === "google"
            ? "bg-secondary border-secondaryBorder"
            : "bg-primary border-secondary"
        } px-3 py-3 text-sm leading-6 text-white shadow-sm hover:brightness-125 transition duration-300 ease-in-out`}
      >
        <FontAwesomeIcon
          icon={icon}
          className="absolute left-16 sm:w-20 sm:left-14 text-accent text-xl"
        />
        <span className="flex items-center text-accent font-normal justify-center w-full">
          {text}
        </span>
      </button>
    </form>
  );
}
