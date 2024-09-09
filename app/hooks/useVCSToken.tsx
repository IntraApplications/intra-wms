"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/_lib/supabase/supabase-client";
import axios from "axios";

const useVCSToken = () => {
  const [providerToken, setProviderToken] = useState<string | null>(null);
  const [providerRefreshToken, setProviderRefreshToken] = useState<
    string | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          setError(error.message);
          return;
        }

        if (data?.session?.provider_token) {
          setProviderToken(data.session.provider_token);
          // Assuming the provider refresh token is stored in a similar manner
          setProviderRefreshToken(data.session.provider_refresh_token || null);
        } else {
          setError("No GitHub token found");
        }
      } catch (err) {
        setError("Failed to retrieve GitHub tokens");
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  const refreshProviderToken = async () => {
    if (!providerRefreshToken) {
      setError("No refresh token available");
      return null;
    }

    try {
      // This is a placeholder. You'll need to implement the actual refresh logic
      // using GitHub's OAuth refresh flow
      const response = await axios.post(
        "https://github.com/login/oauth/access_token",
        {
          refresh_token: providerRefreshToken,
          client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          grant_type: "refresh_token",
        },
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      const newToken = response.data.access_token;
      setProviderToken(newToken);
      return newToken;
    } catch (err) {
      setError("Failed to refresh GitHub token");
      return null;
    }
  };

  return { providerToken, error, loading, refreshProviderToken };
};

export default useVCSToken;
