import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

interface EditModeCtx {
  editMode: boolean;
  isAdmin: boolean; // role-only
  canEdit: boolean; // effective capability: admin + optional MFA/AAL requirements
  toggleEditMode: () => void;
  exitEditMode: () => void;
}

const Ctx = createContext<EditModeCtx>({
  editMode: false,
  isAdmin: false,
  canEdit: false,
  toggleEditMode: () => {},
  exitEditMode: () => {},
});

export function EditModeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  const mountedRef = useRef(true);
  const recomputingRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const setStateSafely = useCallback((next: { isAdmin: boolean; canEdit: boolean; forceEditOff?: boolean }) => {
    if (!mountedRef.current) return;

    setIsAdmin((prev) => (prev === next.isAdmin ? prev : next.isAdmin));
    setCanEdit((prev) => (prev === next.canEdit ? prev : next.canEdit));

    if (next.forceEditOff || !next.canEdit) {
      setEditMode((prev) => (prev ? false : prev));
    }
  }, []);

  const recomputeCapabilities = useCallback(async () => {
    if (recomputingRef.current) return;
    recomputingRef.current = true;

    try {
      if (!user) {
        setStateSafely({ isAdmin: false, canEdit: false, forceEditOff: true });
        return;
      }

      const { data: roles, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (roleError) {
        setStateSafely({ isAdmin: false, canEdit: false, forceEditOff: true });
        return;
      }

      const roleAdmin = (roles ?? []).some((r) => r.role === "admin");

      if (!roleAdmin) {
        setStateSafely({ isAdmin: false, canEdit: false, forceEditOff: true });
        return;
      }

      // isAdmin remains role-only and true from this point onward
      let nextCanEdit = true;

      const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
      if (factorsError) {
        // fail closed
        setStateSafely({ isAdmin: true, canEdit: false, forceEditOff: true });
        return;
      }

      const hasVerifiedTotp = (factors?.all ?? []).some(
        (f) => f.factor_type === "totp" && f.status === "verified",
      );

      if (hasVerifiedTotp) {
        const { data: aal, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aalError) {
          // fail closed
          setStateSafely({ isAdmin: true, canEdit: false, forceEditOff: true });
          return;
        }
        nextCanEdit = aal?.currentLevel === "aal2";
      }

      setStateSafely({ isAdmin: true, canEdit: nextCanEdit, forceEditOff: !nextCanEdit });
    } finally {
      recomputingRef.current = false;
    }
  }, [user, setStateSafely]);

  useEffect(() => {
    void recomputeCapabilities();
  }, [recomputeCapabilities]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        void recomputeCapabilities();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [recomputeCapabilities]);

  const toggleEditMode = () => {
    if (!canEdit) {
      setEditMode((prev) => (prev ? false : prev));
      return;
    }
    setEditMode((v) => !v);
  };

  return (
    <Ctx.Provider
      value={{
        editMode,
        isAdmin,
        canEdit,
        toggleEditMode,
        exitEditMode: () => setEditMode((prev) => (prev ? false : prev)),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useEditMode = () => useContext(Ctx);
