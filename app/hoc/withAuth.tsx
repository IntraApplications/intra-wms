import { useRouter } from "next/navigation";
import { useEffect } from "react";
import useAuth from "@/hooks/useAuth";

const withAuth = (WrappedComponent) => {
  return (props) => {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push("/login"); // Redirect to login if not authenticated
      }
    }, [user, loading, router]);

    if (loading) return <p>Loading...</p>;

    return user ? <WrappedComponent {...props} /> : null;
  };
};

withAuth.displayName = "withAuth";
export default withAuth;
