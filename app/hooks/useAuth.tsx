"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/supabase-client";

const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (data) {
        setUser(data.user);
      }
      setLoading(false);
    };

    getUser();
  }, []);

  return { user, loading };
};

export default useAuth;
