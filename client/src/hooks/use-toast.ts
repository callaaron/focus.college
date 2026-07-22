import { toast as sonnerToast } from "sonner";

/**
 * Thin wrapper around `sonner`'s toast API so legacy call-sites that did
 * `const { toast } = useToast()` keep working. The project renders the
 * global <Toaster /> from @/components/ui/sonner in App.tsx.
 */
export function useToast() {
  return {
    toast: sonnerToast,
    dismiss: sonnerToast.dismiss,
  };
}

export { sonnerToast as toast };
