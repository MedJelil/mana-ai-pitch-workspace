import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  modalSize?: "sm" | "lg";
};

export default function AnimatedModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  modalSize = "lg",
}: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center overflow-y-auto bg-black/40 p-8 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0, rotate: "12deg" }}
            animate={{
              scale: 1,
              rotate: "0deg",
              transition: { type: "spring", bounce: 0.3 },
            }}
            exit={{ scale: 0, rotate: "12deg", transition: { duration: 0.15 } }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "relative w-full cursor-default overflow-hidden rounded-2xl bg-sidebar border border-sidebar-border shadow-2xl p-8 text-sidebar-foreground",
              modalSize === "sm" ? "max-w-sm" : "max-w-lg",
            )}
          >
            <div className="flex flex-col gap-4">
              <div className="space-y-1 text-center">
                <h3
                  className={cn("font-display font-bold text-sidebar-foreground", {
                    "text-2xl": modalSize === "sm",
                    "text-3xl": modalSize === "lg",
                  })}
                >
                  {title}
                </h3>
                {description && (
                  <p className="text-sidebar-foreground/70 text-sm">{description}</p>
                )}
              </div>

              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
