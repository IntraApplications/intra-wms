import Image from "next/image";
import IntraLogo from "@/_assets/intra logo-3-large-transparent.png";
export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <Image
        src={IntraLogo}
        alt="Intra Logo"
        width={100}
        height={100} // Add a height value to maintain aspect ratio
        className="rounded-lm "
      />
      <h1 className="text-center text-lg font-normal text-white mt-4">
        Log in
      </h1>
      <p className="text-center text-sm font-normal text-accent mt-1">
        Log in to your account
      </p>
    </div>
  );
}
