import { useState, useEffect } from "react";
import { supabase } from "@/_lib/supabase";

const useVCSToken = () => {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setError(error.message);
          return;
        }

        console.log(data);
        if (data?.session?.provider_token) {
          setToken(data.session.provider_token);
        } else {
          setError("No GitHub token found");
        }
      } catch (err) {
        setError("Failed to retrieve session");
      } finally {
        setLoading(false);
      }
    };

    fetchToken();
  }, []);

  return { token, error, loading };
};

export default useVCSToken;
