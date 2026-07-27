import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck, User, Stethoscope, Settings, Mail, Lock, ArrowLeft, ChevronRight, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, signupPatient, isAuthenticated, role, isLoading } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<"role" | "form">("role");
  const [selectedRole, setSelectedRole] = useState<"patient" | "doctor" | "admin">("patient");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // For patient: "login" or "signup" mode
  const [formMode, setFormMode] = useState<"login" | "signup">("login");

  // Credentials are never pre-filled. This form used to seed real working
  // logins — including an administrator's — which put privileged credentials on
  // a public page and one click away from use by anyone who opened it.
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  // Read URL query params on mount
  useEffect(() => {
    const roleParam = searchParams.get("role") as "patient" | "doctor" | "admin" | null;
    const modeParam = searchParams.get("mode") as "login" | "signup" | null;
    if (roleParam) {
      setSelectedRole(roleParam);
      // Only patients may self-register; any other role opens the login form.
      setFormMode(roleParam === "patient" && modeParam === "signup" ? "signup" : "login");
      setStep("form");
      setEmailInput("");
      setPasswordInput("");
    }
  }, [searchParams]);

  // Redirect to dashboard once authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated && role) {
      navigate(`/${role}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, role, navigate, isLoading]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-body-sm font-semibold text-muted-foreground">Verifying secure credentials...</p>
        </div>
      </div>
    );
  }

  const handleRoleSelect = (roleVal: "patient" | "doctor" | "admin") => {
    setSelectedRole(roleVal);
    setFormMode("login");
    setStep("form");
    setEmailInput("");
    setPasswordInput("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = emailInput.trim();
    const password = passwordInput.trim();

    // Read the submitted form fields. This was previously referenced as a bare
    // `formData` identifier that was never defined, so patient signup threw
    // ReferenceError before it could reach the API.
    const formData = new FormData(e.currentTarget);

    setIsSubmitting(true);
    try {
      if (selectedRole === "patient" && formMode === "signup") {
        // Patient signup flow
        const firstName = formData.get("firstName") as string;
        const lastName = formData.get("lastName") as string;
        const phone = formData.get("phone") as string;

        if (!firstName || !lastName) {
          throw new Error("First Name and Last Name are required.");
        }

        await signupPatient({
          email,
          password,
          profile: {
            first_name: firstName,
            last_name: lastName,
            phone: phone || "+1 (555) 000-0000",
            date_of_birth: "1990-01-01",
            gender: "other",
          },
        });

        toast({
          title: "Account Created",
          description: "Registration successful! Please log in to continue.",
        });
        setFormMode("login");
      } else {
        // Login flow (all roles)
        await login({ email, password });
        toast({
          title: "Login Successful",
          description: "Welcome to the MedBridge Platform.",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: (err as Error).message || "Invalid credentials, please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-gradient relative min-h-screen overflow-hidden">
      <div className="ambient-blob -right-[10%] -top-[10%] h-[50%] w-[50%] bg-primary/5" />
      <div className="ambient-blob -bottom-[10%] -left-[10%] h-[40%] w-[40%] bg-secondary/5" />

      <main className="relative flex min-h-screen flex-col items-center justify-center p-6 md:p-12">
        <div className="mb-12 flex flex-col items-center space-y-2 animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-primary">
            <ShieldCheck className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="font-headline text-headline-lg text-primary tracking-tight">MedBridge</h1>
          <p className="text-label-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">MedBridge AI Healthcare Platform</p>
        </div>

        <div className="relative w-full max-w-[1100px]">
          {step === "role" && (
            <section className="animate-fade-in">
              <div className="mb-10 text-center">
                <h2 className="font-headline text-headline-lg text-foreground mb-2">Welcome Back</h2>
                <p className="text-body-md text-muted-foreground">Please select your portal to continue to MedBridge Cloud</p>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <button
                  onClick={() => handleRoleSelect("patient")}
                  className="group relative flex flex-col items-center rounded-2xl border border-border-subtle bg-card p-8 text-center shadow-card transition-all duration-300 hover:border-primary/30 hover:shadow-card-lg"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent transition-transform group-hover:scale-110">
                    <User className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-headline text-headline-md text-foreground mb-3">Patient</h3>
                  <p className="mb-6 text-body-sm text-muted-foreground">Manage your health data, access AI reports, and view prescriptions.</p>
                  <span className="mt-auto flex items-center font-medium text-primary transition-transform group-hover:translate-x-1">
                    Enter Portal <ChevronRight className="ml-1 h-4 w-4" />
                  </span>
                </button>

                <button
                  onClick={() => handleRoleSelect("doctor")}
                  className="group relative flex flex-col items-center rounded-2xl border border-border-subtle bg-card p-8 text-center shadow-card transition-all duration-300 hover:border-primary/30 hover:shadow-card-lg"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10 transition-transform group-hover:scale-110">
                    <Stethoscope className="h-7 w-7 text-secondary" />
                  </div>
                  <h3 className="font-headline text-headline-md text-foreground mb-3">Clinician</h3>
                  <p className="mb-6 text-body-sm text-muted-foreground">Access patient intake AI, surgical analytics, and clinical workflows.</p>
                  <span className="mt-auto flex items-center font-medium text-primary transition-transform group-hover:translate-x-1">
                    Medical Login <ChevronRight className="ml-1 h-4 w-4" />
                  </span>
                </button>

                <button
                  onClick={() => handleRoleSelect("admin")}
                  className="group relative flex flex-col items-center rounded-2xl border border-border-subtle bg-card p-8 text-center shadow-card transition-all duration-300 hover:border-primary/30 hover:shadow-card-lg"
                >
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-tertiary/10 transition-transform group-hover:scale-110">
                    <Settings className="h-7 w-7 text-tertiary" />
                  </div>
                  <h3 className="font-headline text-headline-md text-foreground mb-3">Administrator</h3>
                  <p className="mb-6 text-body-sm text-muted-foreground">Enterprise configuration, system health monitoring, and user management.</p>
                  <span className="mt-auto flex items-center font-medium text-primary transition-transform group-hover:translate-x-1">
                    Admin Access <ChevronRight className="ml-1 h-4 w-4" />
                  </span>
                </button>
              </div>
            </section>
          )}

          {step === "form" && (
            <section className="mx-auto flex max-w-[900px] flex-col items-stretch gap-8 md:flex-row animate-fade-in">
              <div className="flex-1 rounded-2xl border border-border-subtle bg-card p-8 shadow-card-lg md:p-10">
                <button
                  onClick={() => setStep("role")}
                  className="mb-8 flex items-center font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back to roles
                </button>
                <header className="mb-8">
                  <h2 className="font-headline text-headline-lg text-foreground">
                    {selectedRole === "patient"
                      ? formMode === "signup"
                        ? "Create Account"
                        : "Patient Login"
                      : selectedRole === "doctor"
                      ? "Clinician Login"
                      : "Admin Login"}
                  </h2>
                  <p className="mt-2 text-body-md text-muted-foreground">
                    {selectedRole === "patient" && formMode === "signup"
                      ? "Start your journey with MedBridge Clinical AI."
                      : "Secure access to the MedBridge Healthcare Platform."}
                  </p>
                  {/* Patient toggle: Login ↔ Signup */}
                  {selectedRole === "patient" && (
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormMode("signup")}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                          formMode === "signup"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        New Patient
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormMode("login")}
                        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                          formMode === "login"
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Returning Patient
                      </button>
                    </div>
                  )}
                </header>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  {/* Signup-only fields */}
                  {selectedRole === "patient" && formMode === "signup" && (
                    <>
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">First Name</label>
                          <input
                            name="firstName"
                            required
                            className="w-full rounded-xl border border-border-subtle bg-card px-4 py-3 transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                            placeholder="Jane"
                            type="text"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                          <input
                            name="lastName"
                            required
                            className="w-full rounded-xl border border-border-subtle bg-card px-4 py-3 transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                            placeholder="Doe"
                            type="text"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                        <input
                          name="phone"
                          className="w-full rounded-xl border border-border-subtle bg-card px-4 py-3 transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                          placeholder="+1 (555) 000-0000"
                          type="tel"
                        />
                      </div>
                    </>
                  )}

                  {/* A "click to fill" panel of working accounts used to sit
                      here, including an administrator's. Publishing privileged
                      credentials on the sign-in page of a clinical system hands
                      every visitor an admin session, so it has been removed;
                      demo accounts belong in seed data and documentation. */}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        name="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        required
                        className="w-full rounded-xl border border-border-subtle bg-card py-3 pl-12 pr-4 transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                        placeholder="patient@example.com"
                        type="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <input
                        name="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        required
                        className="w-full rounded-xl border border-border-subtle bg-card py-3 pl-12 pr-12 transition-all focus:border-primary focus:ring-2 focus:ring-primary/10"
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>


                  {selectedRole === "patient" && formMode === "signup" && (
                    <div className="flex items-start gap-3 pt-2">
                      <input
                        required
                        className="mt-1 h-5 w-5 rounded border-border-subtle text-primary focus:ring-primary"
                        type="checkbox"
                      />
                      <label className="text-body-sm leading-tight text-muted-foreground">
                        I agree to the{" "}
                        <a className="font-semibold text-primary hover:underline" href="#">
                          Clinical Data Privacy Policy
                        </a>{" "}
                        and MedBridge's handling of my PHI under HIPAA guidelines.
                      </label>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-2xl bg-primary py-4 font-headline text-headline-md text-primary-foreground shadow-primary transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        {selectedRole === "patient" && formMode === "signup"
                          ? "Creating Account..."
                          : "Signing In..."}
                      </span>
                    ) : selectedRole === "patient" && formMode === "signup" ? (
                      "Join MedBridge"
                    ) : (
                      "Secure Login"
                    )}
                  </button>
                </form>
              </div>

              <div className="hidden md:flex w-[340px] flex-col gap-6">
                <div className="rounded-2xl border border-primary/10 bg-primary/5 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <span className="font-headline text-[18px] text-primary">HIPAA Certified</span>
                  </div>
                  <p className="text-body-sm text-muted-foreground">
                    Your medical records are encrypted with AES-256 standard and stored in isolated high-security clinical cloud clusters.
                  </p>
                </div>
                <div className="flex-1 rounded-2xl bg-gradient-to-br from-primary to-primary-container p-6">
                  <p className="font-headline text-headline-md text-primary-foreground mb-2">Powered by Clinical AI</p>
                  <p className="text-body-sm text-primary-foreground/80">
                    Access real-time vital analysis and early diagnostic indicators directly on your dashboard.
                  </p>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-card p-4">
                  <div className="flex -space-x-2">
                    {["A", "B", "C"].map((initial, i) => (
                      <div
                        key={i}
                        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-primary-container text-xs font-bold text-primary-foreground"
                      >
                        {initial}
                      </div>
                    ))}
                  </div>
                  <span className="text-label-sm font-semibold text-muted-foreground">Used by 4,000+ Specialists</span>
                </div>
              </div>
            </section>
          )}
        </div>

        <footer className="mt-16 flex w-full max-w-4xl flex-col items-center justify-between gap-4 border-t border-border-subtle py-8 text-muted-foreground md:flex-row">
          <div className="flex gap-6">
            <a className="transition-colors hover:text-primary" href="#">Privacy Policy</a>
            <a className="transition-colors hover:text-primary" href="#">Terms of Service</a>
            <a className="transition-colors hover:text-primary" href="#">Help Center</a>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
            <span>All clinical systems operational</span>
          </div>
          <p>© 2024 MedBridge Enterprise. v2.4.0-Stable</p>
        </footer>
      </main>
    </div>
  );
}
