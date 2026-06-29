import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface EditModeCtx {
  editMode: boolean;
  isAdmin: boolean;
  toggleEditMode: () => void;
  exitEditMode: () => void;
}

const Ctx = createContext<EditModeCtx>({
  editMode: false,
  isAdmin: false,
  toggleEditMode: () => {},
  exitEditMode: () => {},
});

export function EditModeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) { setIsAdmin(false); setEditMode(false); return; }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => {
        setIsAdmin((data ?? []).some((r) => r.role === "admin"));
      });
  }, [user]);

  useEffect(() => {
    if (!user) setEditMode(false);
  }, [user]);

  return (
    <Ctx.Provider value={{
      editMode,
      isAdmin,
      toggleEditMode: () => setEditMode((v) => !v),
      exitEditMode: () => setEditMode(false),
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useEditMode = () => useContext(Ctx);