import { Pencil, X, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditMode } from "@/contexts/EditModeContext";

export function EditModeButton() {
  const { editMode, isAdmin, toggleEditMode, exitEditMode } = useEditMode();

  // Never render for non-admins — zero DOM footprint for visitors
  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {editMode && (
          <motion.button
            key="exit"
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            onClick={exitEditMode}
            className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card/90 px-4 py-2.5 text-sm font-medium text-muted-foreground shadow-lg backdrop-blur transition hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Exit Editing
          </motion.button>
        )}
      </AnimatePresence>

      <motion.button
        layout
        onClick={toggleEditMode}
        className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold shadow-xl shadow-violet/20 transition-all ${
          editMode
            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
            : "bg-gradient-to-r from-violet to-electric text-white hover:opacity-90"
        }`}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
      >
        {editMode ? (
          <><CheckCheck className="h-4 w-4" />Editing Active</>
        ) : (
          <><Pencil className="h-4 w-4" />Edit Portfolio</>
        )}
      </motion.button>
    </div>
  );
}