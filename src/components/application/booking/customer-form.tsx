import { useState } from "react";
import { User, Mail, Phone, MessageSquare, Loader2, ArrowRight } from "lucide-react";
import { z } from "zod";
import { cn } from "@/lib/utils";

const customerFormSchema = z.object({
  name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  notes: z.string().max(500).optional(),
});

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

interface CustomerFormProps {
  initialData?: Partial<CustomerFormData>;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  onErrorClear?: () => void;
  className?: string;
}

export function CustomerForm({
  initialData = {},
  onSubmit,
  loading = false,
  error = null,
  onErrorClear,
  className = "",
}: CustomerFormProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: initialData.name ?? "",
    email: initialData.email ?? "",
    phone: initialData.phone ?? "",
    notes: initialData.notes ?? "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = customerFormSchema.parse(formData);
      setErrors({});
      await onSubmit(validatedData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message;
        });
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <div className={cn("bg-surface-container-low p-8 md:p-12 rounded-[2.5rem] border border-surface-container shadow-sm", className)}>
      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Name Field */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 ml-4">Full Name</label>
            <div className="relative group">
              <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary opacity-30 group-focus-within:opacity-100 transition-opacity" />
              <input
                type="text"
                placeholder="Chinyere Okafor"
                className={cn(
                  "w-full bg-background border-2 border-transparent focus:border-primary/20 rounded-3xl py-5 pl-14 pr-8 text-primary font-sans transition-all outline-none",
                  errors.name ? "border-error/20 bg-error/5" : "bg-white"
                )}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <p className="text-[10px] font-bold text-error mt-2 ml-4 uppercase tracking-wider">{errors.name}</p>}
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 ml-4">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary opacity-30 group-focus-within:opacity-100 transition-opacity" />
              <input
                type="email"
                placeholder="chinyere@example.com"
                className={cn(
                  "w-full bg-background border-2 border-transparent focus:border-primary/20 rounded-3xl py-5 pl-14 pr-8 text-primary font-sans transition-all outline-none",
                  errors.email ? "border-error/20 bg-error/5" : "bg-white"
                )}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {errors.email && <p className="text-[10px] font-bold text-error mt-2 ml-4 uppercase tracking-wider">{errors.email}</p>}
            </div>
          </div>

          {/* Phone Field */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 ml-4">Phone Number</label>
            <div className="relative group">
              <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary opacity-30 group-focus-within:opacity-100 transition-opacity" />
              <input
                type="tel"
                placeholder="+234 800 000 0000"
                className={cn(
                  "w-full bg-background border-2 border-transparent focus:border-primary/20 rounded-3xl py-5 pl-14 pr-8 text-primary font-sans transition-all outline-none",
                  errors.phone ? "border-error/20 bg-error/5" : "bg-white"
                )}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              {errors.phone && <p className="text-[10px] font-bold text-error mt-2 ml-4 uppercase tracking-wider">{errors.phone}</p>}
            </div>
          </div>

          {/* Notes Field */}
          <div className="space-y-3 md:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 ml-4">Special Requests (Optional)</label>
            <div className="relative group">
              <MessageSquare className="absolute left-6 top-6 w-5 h-5 text-primary opacity-30 group-focus-within:opacity-100 transition-opacity" />
              <textarea
                placeholder="Any details you'd like to share..."
                className="w-full bg-white border-2 border-transparent focus:border-primary/20 rounded-[2rem] py-6 pl-14 pr-8 text-primary font-sans transition-all outline-none min-h-[150px] resize-none"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-6 rounded-2xl bg-error/5 border border-error/10 text-error text-sm font-medium flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-error animate-pulse" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-6 rounded-full bg-primary text-on-primary font-bold uppercase tracking-[0.2em] text-xs shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Confirm Appointment
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
