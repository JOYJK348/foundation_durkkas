"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Laptop, 
  BookOpen, 
  Calendar, 
  ArrowRight, 
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Copy,
  User,
  Users,
  Shield
} from "lucide-react";
import { useAppStore } from "@/lib/store";

type PortalType = "online" | "offline" | "workshop" | null;
type RoleType = "student" | "tutor" | "admin";

// Demo credentials for all portals and roles
const demoCredentials = [
  // Online Portal
  { email: "student@online.com", password: "student123", portal: "online" as const, role: "student" as const, name: "Online Student" },
  { email: "tutor@online.com", password: "tutor123", portal: "online" as const, role: "tutor" as const, name: "Online Tutor" },
  { email: "admin@online.com", password: "admin123", portal: "online" as const, role: "admin" as const, name: "Online Admin" },
  // Offline Portal
  { email: "student@offline.com", password: "student123", portal: "offline" as const, role: "student" as const, name: "Offline Student" },
  { email: "tutor@offline.com", password: "tutor123", portal: "offline" as const, role: "tutor" as const, name: "Offline Tutor" },
  { email: "admin@offline.com", password: "admin123", portal: "offline" as const, role: "admin" as const, name: "Offline Admin" },
  // Workshop Portal
  { email: "student@workshop.com", password: "student123", portal: "workshop" as const, role: "student" as const, name: "Workshop Student" },
  { email: "tutor@workshop.com", password: "tutor123", portal: "workshop" as const, role: "tutor" as const, name: "Workshop Tutor" },
  { email: "admin@workshop.com", password: "admin123", portal: "workshop" as const, role: "admin" as const, name: "Workshop Admin" },
];

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAppStore((state) => state.setUser);
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    otp: "",
  });

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // Check if credentials match demo credentials
    const matchedCredential = demoCredentials.find(
      cred => cred.email.toLowerCase() === formData.email.toLowerCase() && 
              cred.password === formData.password
    );

    if (matchedCredential) {
      // Set user in store with matched credentials
      setUser({
        id: "1",
        email: matchedCredential.email,
        phone: formData.phone || null,
        name: matchedCredential.name,
        role: matchedCredential.role,
        portal: matchedCredential.portal,
      });

      // Redirect to dashboard based on portal and role
      router.push(`/dashboard/${matchedCredential.portal}/${matchedCredential.role}`);
      return;
    }

    // Fallback: Auto-detect role and portal based on email/phone
    let role: RoleType = "student";
    let portal: PortalType = "online";
    const emailOrPhone = (formData.email || formData.phone || "").toLowerCase();
    
    // Detect role
    if (emailOrPhone.includes("tutor") || emailOrPhone.includes("teacher")) {
      role = "tutor";
    } else if (emailOrPhone.includes("admin") || emailOrPhone.includes("administrator")) {
      role = "admin";
    }

    // Detect portal
    if (emailOrPhone.includes("@offline") || emailOrPhone.includes("offline")) {
      portal = "offline";
    } else if (emailOrPhone.includes("@workshop") || emailOrPhone.includes("workshop")) {
      portal = "workshop";
    } else {
      portal = "online";
    }

    // Set user in store
    setUser({
      id: "1",
      email: formData.email || null,
      phone: formData.phone || null,
      name: `${role.charAt(0).toUpperCase() + role.slice(1)} User`,
      role: role,
      portal: portal,
    });

    // Redirect to dashboard
    router.push(`/dashboard/${portal}/${role}`);
  };

  const handleDemoClick = (credential: typeof demoCredentials[0]) => {
    setFormData({
      email: credential.email,
      phone: "",
      password: credential.password,
      otp: "",
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getRoleIcon = (role: RoleType) => {
    switch (role) {
      case "student":
        return User;
      case "tutor":
        return Users;
      case "admin":
        return Shield;
      default:
        return User;
    }
  };

  const getPortalIcon = (portal: PortalType) => {
    switch (portal) {
      case "online":
        return Laptop;
      case "offline":
        return BookOpen;
      case "workshop":
        return Calendar;
      default:
        return Laptop;
    }
  };

  const getPortalColor = (portal: PortalType) => {
    switch (portal) {
      case "online":
        return "from-blue-500 to-cyan-500";
      case "offline":
        return "from-green-500 to-emerald-500";
      case "workshop":
        return "from-orange-500 to-red-500";
      default:
        return "from-blue-500 to-cyan-500";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="w-full max-w-5xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-10"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-block mb-4"
          >
            <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
              DURKKAS EMS
            </h1>
          </motion.div>
          <p className="text-base sm:text-lg text-muted-foreground">
            Unified Login - Access All Portals
          </p>
        </motion.div>

        {/* Single Login Form Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-6 sm:p-8"
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Welcome Back</h2>
            <p className="text-muted-foreground mb-6">Sign in to your account</p>

            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              {/* Login Method Toggle */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setLoginMethod("password")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    loginMethod === "password"
                      ? "bg-white text-primary shadow-sm"
                      : "text-gray-600"
                  }`}
                >
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod("otp")}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                    loginMethod === "otp"
                      ? "bg-white text-primary shadow-sm"
                      : "text-gray-600"
                  }`}
                >
                  OTP
                </button>
              </div>

              {/* Email/Phone Input */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {loginMethod === "otp" ? "Phone Number" : "Email"}
                </label>
                <div className="relative">
                  {loginMethod === "otp" ? (
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  )}
                  <Input
                    type={loginMethod === "otp" ? "tel" : "email"}
                    placeholder={loginMethod === "otp" ? "+91 9876543210" : "your.email@example.com"}
                    value={loginMethod === "otp" ? formData.phone : formData.email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [loginMethod === "otp" ? "phone" : "email"]: e.target.value,
                      })
                    }
                    className="pl-10 h-12"
                  />
                </div>
              </div>

              {/* Password Input */}
              {loginMethod === "password" && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="pl-10 pr-10 h-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* OTP Input */}
              {loginMethod === "otp" && (
                <div>
                  <label className="text-sm font-medium mb-2 block">OTP</label>
                  <Input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={formData.otp}
                    onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                    maxLength={6}
                    className="h-12 text-center text-2xl tracking-widest"
                  />
                </div>
              )}

              {/* Forgot Password */}
              {loginMethod === "password" && (
                <div className="text-right">
                  <a href="#" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full h-12 sm:h-14 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all group"
                size="lg"
              >
                Sign In
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          </motion.div>

          {/* Demo Credentials */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200/50 p-6 sm:p-8"
          >
            <div className="mb-4">
              <h3 className="text-xl sm:text-2xl font-bold mb-2">Demo Credentials</h3>
              <p className="text-sm text-muted-foreground">
                Click on any credential to auto-fill the login form
              </p>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {demoCredentials.map((cred, index) => {
                    const RoleIcon = getRoleIcon(cred.role);
                    const PortalIcon = getPortalIcon(cred.portal);
                    const portalColor = getPortalColor(cred.portal);
                    
                    return (
                      <motion.div
                        key={`${cred.portal}-${cred.role}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleDemoClick(cred)}
                        className="p-3 rounded-lg border border-gray-200 hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* Portal Icon */}
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${portalColor} flex items-center justify-center flex-shrink-0`}>
                              <PortalIcon className="h-5 w-5 text-white" />
                            </div>
                            
                            {/* Role Icon */}
                            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <RoleIcon className="h-4 w-4 text-gray-600" />
                            </div>

                            {/* Credentials */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-gray-500 uppercase">
                                  {cred.portal}
                                </span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs font-semibold text-gray-500 uppercase">
                                  {cred.role}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3 w-3 text-gray-400" />
                                  <span className="text-sm font-mono text-gray-700 truncate">
                                    {cred.email}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(cred.email);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Copy className="h-3 w-3 text-gray-400 hover:text-primary" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Lock className="h-3 w-3 text-gray-400" />
                                  <span className="text-sm font-mono text-gray-700">
                                    {cred.password}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(cred.password);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Copy className="h-3 w-3 text-gray-400 hover:text-primary" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Arrow */}
                          <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </div>
                      </motion.div>
                    );
                  })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
