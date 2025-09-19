import React, { useState, useRef, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import { useRouter } from "next/router";
import CachedImage from "../components/utils/CachedImage";
import useIsMobile from "../hooks/useIsMobile";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import {
  Card,
  CardBody,
  Button,
  Input,
  Chip,
  Spinner,
  Skeleton,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}

// Hook pour la logique des paramètres
function useSettingsLogic() {
  const { user, setUser, apiKey } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // États
  const [username, setUsername] = useState(user?.username || "");
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameSuccess, setUsernameSuccess] = useState("");
  const [usernameError, setUsernameError] = useState("");
  
  const [showApiKey, setShowApiKey] = useState(false);
  
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeySuccess, setPasskeySuccess] = useState("");
  const [passkeyError, setPasskeyError] = useState("");
  
  const [showGoogleAuthModal, setShowGoogleAuthModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  
  const linkText = user?.discord_id ? "Discord linked" : "Link Discord";

  // Gestionnaires d'événements
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile || !user) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const response = await fetch("/api/user/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUser({ ...user, avatar: data.avatar });
        setSuccess("Avatar updated successfully!");
        setAvatarFile(null);
      } else {
        setError(data.error || "Failed to update avatar");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleUsernameSave = async () => {
    if (!user) return;

    setUsernameLoading(true);
    setUsernameError("");
    setUsernameSuccess("");

    try {
      const response = await fetch("/api/user/username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser({ ...user, username });
        setUsernameSuccess("Username updated successfully!");
      } else {
        setUsernameError(data.error || "Failed to update username");
      }
    } catch (err) {
      setUsernameError("Network error occurred");
    } finally {
      setUsernameLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match");
      return;
    }

    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");

    try {
      const response = await fetch("/api/user/password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPasswordSuccess("Password updated successfully!");
        form.reset();
        setTimeout(() => {
          setShowPasswordModal(false);
          setPasswordSuccess("");
        }, 2000);
      } else {
        setPasswordError(data.error || "Failed to update password");
      }
    } catch (err) {
      setPasswordError("Network error occurred");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRegisterPasskey = async () => {
    if (!user) return;

    setPasskeyLoading(true);
    setPasskeyError("");
    setPasskeySuccess("");

    try {
      // Première étape : obtenir les options du serveur
      const optionsResponse = await fetch("/api/auth/passkey/register/begin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!optionsResponse.ok) {
        throw new Error("Failed to get registration options");
      }

      const options = await optionsResponse.json();

      // Convertir les chaînes base64 en Uint8Array
      if (typeof options.challenge === "string") {
        options.challenge = Uint8Array.from(atob(options.challenge), (c) =>
          c.charCodeAt(0)
        );
      }
      if (typeof options.user.id === "string") {
        options.user.id = Uint8Array.from(atob(options.user.id), (c) =>
          c.charCodeAt(0)
        );
      }
      if (!options.user.name) {
        options.user.name = user?.email || user?.username || "user";
      }
      if (!options.user.displayName) {
        options.user.displayName = user?.username || user?.email || "User";
      }

      try {
        const cred = await navigator.credentials.create({ publicKey: options });
        if (!cred) throw new Error("Passkey creation failed");

        // Sérialiser les données pour l'envoi
        function bufferToBase64url(buf: ArrayBuffer): string {
          let str = btoa(String.fromCharCode(...new Uint8Array(buf)));
          return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        }

        const credential = cred as PublicKeyCredential;
        const response = credential.response as AuthenticatorAttestationResponse;

        const credentialData = {
          id: credential.id,
          rawId: bufferToBase64url(credential.rawId),
          response: {
            attestationObject: bufferToBase64url(response.attestationObject),
            clientDataJSON: bufferToBase64url(response.clientDataJSON),
          },
          type: credential.type,
        };

        // Deuxième étape : envoyer les données au serveur
        const verifyResponse = await fetch("/api/auth/passkey/register/complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(credentialData),
        });

        if (!verifyResponse.ok) {
          throw new Error("Failed to verify passkey");
        }

        setPasskeySuccess("Passkey registered successfully!");
      } catch (credError) {
        console.error("Credential creation error:", credError);
        throw new Error("Failed to create passkey");
      }
    } catch (err) {
      console.error("Passkey registration error:", err);
      setPasskeyError(err instanceof Error ? err.message : "Failed to register passkey");
    } finally {
      setPasskeyLoading(false);
    }
  };

  return {
    user,
    setUser,
    username,
    usernameLoading,
    usernameSuccess,
    usernameError,
    showApiKey,
    setShowApiKey,
    avatar,
    avatarFile,
    loading,
    success,
    error,
    fileInputRef,
    linkText,
    showPasswordModal,
    setShowPasswordModal,
    passwordLoading,
    passwordSuccess,
    passwordError,
    handleAvatarChange,
    handleAvatarUpload,
    handleUsernameChange,
    handleUsernameSave,
    handlePasswordChange,
    passkeyLoading,
    passkeySuccess,
    passkeyError,
    handleRegisterPasskey,
    showGoogleAuthModal,
    setShowGoogleAuthModal,
    showSecurityModal,
    setShowSecurityModal,
    router,
  };
}

// Modal pour changer le mot de passe
function PasswordModal({ 
  open, 
  onClose, 
  onSubmit, 
  loading, 
  success, 
  error 
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  success: string;
  error: string;
}) {
  const { t } = useTranslation("common");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-full max-w-md bg-background border border-gray-700">
        <CardBody className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-foreground">{t("settings.changePassword")}</h2>
            <Button
              isIconOnly
              variant="light"
              onPress={onClose}
              className="text-gray-400 hover:text-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"></path>
              </svg>
            </Button>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Input
              type="password"
              name="currentPassword"
              label="Current Password"
              variant="bordered"
              classNames={{
                input: "bg-transparent",
                inputWrapper: "bg-default-100 border-gray-600",
              }}
              required
            />
            <Input
              type="password"
              name="newPassword"
              label="New Password"
              variant="bordered"
              classNames={{
                input: "bg-transparent",
                inputWrapper: "bg-default-100 border-gray-600",
              }}
              required
            />
            <Input
              type="password"
              name="confirmPassword"
              label="Confirm New Password"
              variant="bordered"
              classNames={{
                input: "bg-transparent",
                inputWrapper: "bg-default-100 border-gray-600",
              }}
              required
            />

            <div className="flex gap-2 mt-4">
              <Button
                type="submit"
                color="primary"
                className="flex-1"
                isLoading={loading}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Password"}
              </Button>
              <Button
                variant="bordered"
                onPress={onClose}
                className="flex-1 border-gray-600"
                disabled={loading}
              >
                Cancel
              </Button>
            </div>

            {success && (
              <div className="text-success text-sm mt-2">{success}</div>
            )}
            {error && (
              <div className="text-danger text-sm mt-2">{error}</div>
            )}
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

// Modal pour Google Authenticator
function GoogleAuthModal({ 
  open, 
  onClose 
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { apiKey } = useAuth();
  const [step, setStep] = useState<"generate" | "validate">("generate");
  const [qrCode, setQrCode] = useState<string>("");
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setQrCode(data.qrCode);
        setStep("validate");
      } else {
        setError(data.error || "Failed to generate QR code");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ token: passcode }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Google Authenticator setup successfully!");
        setTimeout(() => {
          onClose();
          setStep("generate");
          setQrCode("");
          setPasscode("");
          setSuccess("");
        }, 2000);
      } else {
        setError(data.error || "Invalid passcode");
      }
    } catch (err) {
      setError("Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-full max-w-md bg-background border border-gray-700">
        <CardBody className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-foreground">Setup Google Authenticator</h2>
            <Button
              isIconOnly
              variant="light"
              onPress={onClose}
              className="text-gray-400 hover:text-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                <path d="M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z"></path>
              </svg>
            </Button>
          </div>

          {step === "generate" ? (
            <Button
              color="primary"
              className="w-full"
              onPress={handleGenerate}
              isLoading={loading}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Key & QR Code"}
            </Button>
          ) : (
            <div className="flex flex-col gap-4">
              {qrCode && (
                <div className="text-center">
                  <CachedImage
                    src={qrCode}
                    alt="QR Code"
                    style={{ width: 180, height: 180, margin: "0 auto" }}
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    Scan with Google Authenticator
                  </p>
                </div>
              )}
              
              <form onSubmit={handleValidate} className="flex flex-col gap-4">
                <Input
                  type="text"
                  label="Enter passcode from app"
                  variant="bordered"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  classNames={{
                    input: "bg-transparent",
                    inputWrapper: "bg-default-100 border-gray-600",
                  }}
                  required
                />

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    color="primary"
                    className="flex-1"
                    isLoading={loading}
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Verify & Enable"}
                  </Button>
                  <Button
                    variant="bordered"
                    onPress={onClose}
                    className="flex-1 border-gray-600"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </div>

                {success && (
                  <div className="text-success text-sm">{success}</div>
                )}
                {error && (
                  <div className="text-danger text-sm">{error}</div>
                )}
              </form>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}

// Version Desktop
function SettingsDesktop(props: ReturnType<typeof useSettingsLogic>) {
  const { apiKey } = useAuth();
  const {
    user,
    username,
    usernameLoading,
    usernameSuccess,
    usernameError,
    showApiKey,
    setShowApiKey,
    avatar,
    avatarFile,
    loading,
    success,
    error,
    fileInputRef,
    linkText,
    showPasswordModal,
    setShowPasswordModal,
    passwordLoading,
    passwordSuccess,
    passwordError,
    handleAvatarChange,
    handleAvatarUpload,
    handleUsernameChange,
    handleUsernameSave,
    handlePasswordChange,
    passkeyLoading,
    passkeySuccess,
    passkeyError,
    handleRegisterPasskey,
    showGoogleAuthModal,
    setShowGoogleAuthModal,
    router,
  } = props;
  
  const { t } = useTranslation("common");

  if (!user) {
    return (
      <div className="bg-background text-foreground font-sans relative min-h-screen">
        <div className="absolute h-screen w-full bg-main-overlay max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top" />
        
        <div className="relative z-10 w-full max-w-[1400px] flex-1 px-3 py-10 flex flex-col gap-16 pb-10 mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md bg-background/50 backdrop-blur-md border border-gray-700">
              <CardBody className="p-8 text-center">
                <Spinner size="lg" className="mb-4" />
                <p className="text-gray-400">Loading user data...</p>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground font-sans relative min-h-screen">
      <div className="absolute h-screen w-full bg-main-overlay max-md:mask-b-from-10% max-md:mask-b-to-70% md:mask-radial-from-10% md:mask-radial-to-70% md:mask-radial-at-top" />
      
      <div className="relative z-10 w-full max-w-[1400px] flex-1 px-3 py-10 flex flex-col gap-16 pb-10 mx-auto">
        
        {/* Header */}
        <section className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 256 256" className="text-primary">
              <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z"></path>
            </svg>
            <h1 className="text-3xl font-bold text-foreground">{t("settings.title")}</h1>
          </div>
          <Button
            variant="bordered"
            startContent={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
              <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z"></path>
            </svg>}
            onPress={() => router.back()}
            className="border-gray-600"
          >
            {t("common.back")}
          </Button>
        </section>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Profile Section */}
          <Card className="bg-background/50 backdrop-blur-md border border-gray-700">
            <CardBody className="p-6">
              <div className="flex items-center gap-2.5 text-xl font-semibold mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path>
                </svg>
                Profile
              </div>

              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <CachedImage
                    src={avatar || `/avatar/${user.id}`}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-600"
                  />
                  <Button
                    isIconOnly
                    size="sm"
                    color="primary"
                    className="absolute bottom-0 right-0"
                    onPress={() => fileInputRef.current?.click()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"></path>
                    </svg>
                  </Button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />

                {avatarFile && (
                  <Button
                    color="primary"
                    onPress={handleAvatarUpload}
                    isLoading={loading}
                    disabled={loading}
                    className="mb-4"
                  >
                    {loading ? "Uploading..." : "Upload Avatar"}
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    label="Username"
                    value={username}
                    onChange={handleUsernameChange}
                    variant="bordered"
                    classNames={{
                      input: "bg-transparent",
                      inputWrapper: "bg-default-100 border-gray-600",
                    }}
                  />
                  <Button
                    color="primary"
                    onPress={handleUsernameSave}
                    isLoading={usernameLoading}
                    disabled={usernameLoading || username === user.username}
                  >
                    Save
                  </Button>
                </div>

                {usernameSuccess && (
                  <div className="text-success text-sm">{usernameSuccess}</div>
                )}
                {usernameError && (
                  <div className="text-danger text-sm">{usernameError}</div>
                )}

                <div className="pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400 mb-2">User ID</p>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-800 px-2 py-1 rounded text-sm flex-1">
                      {user.id}
                    </code>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="bordered"
                      onPress={() => navigator.clipboard.writeText(user.id || "")}
                      className="border-gray-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"></path>
                      </svg>
                    </Button>
                  </div>
                </div>

                {success && (
                  <div className="text-success text-sm">{success}</div>
                )}
                {error && (
                  <div className="text-danger text-sm">{error}</div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Security Section */}
          <Card className="bg-background/50 backdrop-blur-md border border-gray-700">
            <CardBody className="p-6">
              <div className="flex items-center gap-2.5 text-xl font-semibold mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80Zm-80-24a32,32,0,0,1,64,0V80H96Zm80,152H48V96H208V208Zm-68-56a12,12,0,1,1-12-12A12,12,0,0,1,140,152Z"></path>
                </svg>
                Security
              </div>

              <div className="space-y-4">
                <Button
                  color="primary"
                  variant="bordered"
                  onPress={() => setShowPasswordModal(true)}
                  className="w-full border-gray-600"
                  startContent={
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M48,56V200a8,8,0,0,1-16,0V56a8,8,0,0,1,16,0Zm84,54.5L142,96l-10-14.5a8,8,0,0,0-13,0L109,96l10,14.5a8,8,0,0,0,13,0ZM246,120.5,216,80H192a8,8,0,0,0,0,16h16.4l26.1,35.5a8,8,0,0,1,0,9L208.4,176H192a8,8,0,0,0,0,16h24l30-40.5A8,8,0,0,0,246,120.5Z"></path>
                    </svg>
                  }
                >
                  Change Password
                </Button>

                <Button
                  color={user.haveAuthenticator ? "success" : "primary"}
                  variant="bordered"
                  onPress={() => setShowGoogleAuthModal(true)}
                  className="w-full border-gray-600"
                  disabled={user.haveAuthenticator}
                  startContent={
                    user.haveAuthenticator ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H136v48a8,8,0,0,1-16,0V136H72a8,8,0,0,1,0-16h48V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"></path>
                      </svg>
                    )
                  }
                >
                  {user.haveAuthenticator ? "2FA Enabled" : "Setup 2FA"}
                </Button>

                <Button
                  color="primary"
                  variant="bordered"
                  onPress={handleRegisterPasskey}
                  isLoading={passkeyLoading}
                  disabled={passkeyLoading}
                  className="w-full border-gray-600"
                  startContent={
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Z"></path>
                    </svg>
                  }
                >
                  {passkeyLoading ? "Setting up..." : "Add Passkey"}
                </Button>

                {passkeySuccess && (
                  <div className="text-success text-sm">{passkeySuccess}</div>
                )}
                {passkeyError && (
                  <div className="text-danger text-sm">{passkeyError}</div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* API Section */}
          <Card className="bg-background/50 backdrop-blur-md border border-gray-700">
            <CardBody className="p-6">
              <div className="flex items-center gap-2.5 text-xl font-semibold mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M69.12,94.15,28.5,128l40.62,33.85a8,8,0,1,1-10.24,12.29l-48-40a8,8,0,0,1,0-12.29l48-40a8,8,0,1,1,10.24,12.3Zm176,27.7-48-40a8,8,0,1,0-10.24,12.3L227.5,128l-40.62,33.85a8,8,0,1,0,10.24,12.29l48-40a8,8,0,0,0,0-12.29ZM164.1,32.72a8,8,0,0,0-10.38,4.78l-64,176a8,8,0,0,0,4.78,10.38A8.14,8.14,0,0,0,97.34,224a8,8,0,0,0,7.59-5.5l64-176A8,8,0,0,0,164.1,32.72Z"></path>
                </svg>
                API Access
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-2">API Key</p>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-800 px-2 py-1 rounded text-sm flex-1 font-mono">
                      {showApiKey ? apiKey : "•".repeat(32)}
                    </code>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="bordered"
                      onPress={() => setShowApiKey(!showApiKey)}
                      className="border-gray-600"
                    >
                      {showApiKey ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M53.92,34.62A8,8,0,1,0,42.08,45.38L61.32,66.55C25,88.84,9.38,123.2,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208a127.11,127.11,0,0,0,52.07-10.83l22,24.21a8,8,0,1,0,11.84-10.76Zm47.33,75.84,41.67,45.85a32,32,0,0,1-41.67-45.85ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.16,133.16,0,0,1,25,128c4.69-8.79,19.66-33.39,47.35-49.38l18,19.75a48,48,0,0,0,63.66,70l14.73,16.2A112,112,0,0,1,128,192Zm6-95.43a8,8,0,0,1,3-15.72,48.16,48.16,0,0,1,38.77,42.64,8,8,0,0,1-7.22,8.71,6.39,6.39,0,0,1-.75,0,8,8,0,0,1-8-7.26A32.09,32.09,0,0,0,134,96.57Zm113.28,34.69c-.42.94-10.55,23.37-33.36,43.8a8,8,0,1,1-10.67-11.92A132.77,132.77,0,0,0,231.05,128a133.15,133.15,0,0,0-23.12-30.77C185.67,75.19,158.78,64,128,64a118.37,118.37,0,0,0-19.36,1.57A8,8,0,1,1,106,49.79,134,134,0,0,1,128,48c34.88,0,66.57,13.26,91.66,38.35,18.83,18.83,27.3,37.62,27.65,38.41A8,8,0,0,1,247.31,131.26Z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128a133.33,133.33,0,0,1,23.07-30.75C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path>
                        </svg>
                      )}
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="bordered"
                      onPress={() => navigator.clipboard.writeText(apiKey || "")}
                      className="border-gray-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"></path>
                      </svg>
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <p className="text-sm text-gray-400 mb-2">Usage Guidelines</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• Keep your API key secure and don't share it</p>
                    <p>• Rate limit: 1000 requests per hour</p>
                    <p>• Use HTTPS for all API requests</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Social Connections */}
          <Card className="bg-background/50 backdrop-blur-md border border-gray-700">
            <CardBody className="p-6">
              <div className="flex items-center gap-2.5 text-xl font-semibold mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M144,80a64,64,0,1,0-64,64A64.07,64.07,0,0,0,144,80Zm-64,48a48,48,0,1,1,48-48A48.05,48.05,0,0,1,80,128Zm109.25-48h58.07a8,8,0,0,1,0,16H189.25a80.9,80.9,0,0,0-28.5-59.31,8,8,0,0,1,11.3-11.31A96.85,96.85,0,0,1,205.25,80ZM173.25,176a80.9,80.9,0,0,0,28.5-59.31,8,8,0,0,1,15.5,4.62A96.85,96.85,0,0,1,184,176Z"></path>
                </svg>
                Connections
              </div>

              <div className="space-y-4">
                <Button
                  color={user.discord_id ? "success" : "primary"}
                  variant="bordered"
                  disabled={user.discord_id ? true : false}
                  className="w-full border-gray-600"
                  startContent={
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z"/>
                    </svg>
                  }
                >
                  {linkText}
                </Button>

                <Button
                  color="primary"
                  variant="bordered"
                  className="w-full border-gray-600"
                  startContent={
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.627 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  }
                >
                  Connect GitHub
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Modals */}
        <PasswordModal
          open={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onSubmit={handlePasswordChange}
          loading={passwordLoading}
          success={passwordSuccess}
          error={passwordError}
        />

        <GoogleAuthModal
          open={showGoogleAuthModal}
          onClose={() => setShowGoogleAuthModal(false)}
        />
      </div>
    </div>
  );
}

// Version Mobile
function SettingsMobile(props: ReturnType<typeof useSettingsLogic>) {
  const { apiKey } = useAuth();
  const {
    user,
    username,
    usernameLoading,
    usernameSuccess,
    usernameError,
    showApiKey,
    setShowApiKey,
    avatar,
    avatarFile,
    loading,
    success,
    error,
    fileInputRef,
    linkText,
    showPasswordModal,
    setShowPasswordModal,
    passwordLoading,
    passwordSuccess,
    passwordError,
    handleAvatarChange,
    handleAvatarUpload,
    handleUsernameChange,
    handleUsernameSave,
    handlePasswordChange,
    passkeyLoading,
    passkeySuccess,
    passkeyError,
    handleRegisterPasskey,
    showGoogleAuthModal,
    setShowGoogleAuthModal,
    router,
  } = props;
  
  const { t } = useTranslation("common");

  if (!user) {
    return (
      <div className="bg-background text-foreground font-sans relative min-h-screen">
        <div className="absolute h-screen w-full bg-main-overlay mask-b-from-10% mask-b-to-70%" />
        
        <div className="relative z-10 w-full flex-1 px-3 py-6 flex flex-col gap-8 mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-sm bg-background/50 backdrop-blur-md border border-gray-700">
              <CardBody className="p-6 text-center">
                <Spinner size="lg" className="mb-4" />
                <p className="text-gray-400">Loading user data...</p>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground font-sans relative min-h-screen">
      <div className="absolute h-screen w-full bg-main-overlay mask-b-from-10% mask-b-to-70%" />
      
      <div className="relative z-10 w-full flex-1 px-3 py-6 flex flex-col gap-8 mx-auto">
        
        {/* Header */}
        <section className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="currentColor" viewBox="0 0 256 256" className="text-primary">
              <path d="M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z"></path>
            </svg>
            <h1 className="text-2xl font-bold text-foreground">{t("settings.title")}</h1>
          </div>
          <Button
            isIconOnly
            variant="bordered"
            onPress={() => router.back()}
            className="border-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
              <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z"></path>
            </svg>
          </Button>
        </section>

        {/* Content */}
        <div className="space-y-6">
          
          {/* Profile Card */}
          <Card className="bg-background/50 backdrop-blur-md border border-gray-700">
            <CardBody className="p-4">
              <div className="flex items-center gap-2 text-lg font-semibold mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M230.92,212c-15.23-26.33-38.7-45.21-66.09-54.16a72,72,0,1,0-73.66,0C63.78,166.78,40.31,185.66,25.08,212a8,8,0,1,0,13.85,8c18.84-32.56,52.14-52,89.07-52s70.23,19.44,89.07,52a8,8,0,1,0,13.85-8ZM72,96a56,56,0,1,1,56,56A56.06,56.06,0,0,1,72,96Z"></path>
                </svg>
                Profile
              </div>

              <div className="text-center mb-4">
                <div className="relative inline-block mb-3">
                  <CachedImage
                    src={avatar || `/avatar/${user.id}`}
                    alt="Avatar"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-600"
                  />
                  <Button
                    isIconOnly
                    size="sm"
                    color="primary"
                    className="absolute bottom-0 right-0"
                    onPress={() => fileInputRef.current?.click()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M227.31,73.37,182.63,28.68a16,16,0,0,0-22.63,0L36.69,152A15.86,15.86,0,0,0,32,163.31V208a16,16,0,0,0,16,16H92.69A15.86,15.86,0,0,0,104,219.31L227.31,96a16,16,0,0,0,0-22.63ZM92.69,208H48V163.31l88-88L180.69,120ZM192,108.68,147.31,64l24-24L216,84.68Z"></path>
                    </svg>
                  </Button>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />

                {avatarFile && (
                  <Button
                    color="primary"
                    size="sm"
                    onPress={handleAvatarUpload}
                    isLoading={loading}
                    disabled={loading}
                    className="mb-3"
                  >
                    {loading ? "Uploading..." : "Upload"}
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    label="Username"
                    value={username}
                    onChange={handleUsernameChange}
                    variant="bordered"
                    size="sm"
                    classNames={{
                      input: "bg-transparent",
                      inputWrapper: "bg-default-100 border-gray-600",
                    }}
                  />
                  <Button
                    color="primary"
                    size="sm"
                    onPress={handleUsernameSave}
                    isLoading={usernameLoading}
                    disabled={usernameLoading || username === user.username}
                  >
                    Save
                  </Button>
                </div>

                {usernameSuccess && (
                  <div className="text-success text-sm">{usernameSuccess}</div>
                )}
                {usernameError && (
                  <div className="text-danger text-sm">{usernameError}</div>
                )}

                <div className="pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-400 mb-1">User ID</p>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-800 px-2 py-1 rounded text-xs flex-1 truncate">
                      {user.id}
                    </code>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="bordered"
                      onPress={() => navigator.clipboard.writeText(user.id || "")}
                      className="border-gray-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"></path>
                      </svg>
                    </Button>
                  </div>
                </div>

                {success && (
                  <div className="text-success text-sm">{success}</div>
                )}
                {error && (
                  <div className="text-danger text-sm">{error}</div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* Security Card */}
          <Card className="bg-background/50 backdrop-blur-md border border-gray-700">
            <CardBody className="p-4">
              <div className="flex items-center gap-2 text-lg font-semibold mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80Zm-80-24a32,32,0,0,1,64,0V80H96Zm80,152H48V96H208V208Zm-68-56a12,12,0,1,1-12-12A12,12,0,0,1,140,152Z"></path>
                </svg>
                Security
              </div>

              <div className="space-y-3">
                <Button
                  color="primary"
                  variant="bordered"
                  onPress={() => setShowPasswordModal(true)}
                  className="w-full border-gray-600 justify-start"
                  size="sm"
                  startContent={
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M48,56V200a8,8,0,0,1-16,0V56a8,8,0,0,1,16,0Zm84,54.5L142,96l-10-14.5a8,8,0,0,0-13,0L109,96l10,14.5a8,8,0,0,0,13,0ZM246,120.5,216,80H192a8,8,0,0,0,0,16h16.4l26.1,35.5a8,8,0,0,1,0,9L208.4,176H192a8,8,0,0,0,0,16h24l30-40.5A8,8,0,0,0,246,120.5Z"></path>
                    </svg>
                  }
                >
                  Change Password
                </Button>

                <Button
                  color={user.haveAuthenticator ? "success" : "primary"}
                  variant="bordered"
                  onPress={() => setShowGoogleAuthModal(true)}
                  className="w-full border-gray-600 justify-start"
                  size="sm"
                  disabled={user.haveAuthenticator}
                  startContent={
                    user.haveAuthenticator ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm64-88a8,8,0,0,1-8,8H136v48a8,8,0,0,1-16,0V136H72a8,8,0,0,1,0-16h48V72a8,8,0,0,1,16,0v48h48A8,8,0,0,1,192,128Z"></path>
                      </svg>
                    )
                  }
                >
                  {user.haveAuthenticator ? "2FA Enabled" : "Setup 2FA"}
                </Button>

                <Button
                  color="primary"
                  variant="bordered"
                  onPress={handleRegisterPasskey}
                  isLoading={passkeyLoading}
                  disabled={passkeyLoading}
                  className="w-full border-gray-600 justify-start"
                  size="sm"
                  startContent={
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M208,80H176V56a48,48,0,0,0-96,0V80H48A16,16,0,0,0,32,96V208a16,16,0,0,0,16,16H208a16,16,0,0,0,16-16V96A16,16,0,0,0,208,80ZM96,56a32,32,0,0,1,64,0V80H96ZM208,208H48V96H208V208Z"></path>
                    </svg>
                  }
                >
                  {passkeyLoading ? "Setting up..." : "Add Passkey"}
                </Button>

                {passkeySuccess && (
                  <div className="text-success text-sm">{passkeySuccess}</div>
                )}
                {passkeyError && (
                  <div className="text-danger text-sm">{passkeyError}</div>
                )}
              </div>
            </CardBody>
          </Card>

          {/* API Card */}
          <Card className="bg-background/50 backdrop-blur-md border border-gray-700">
            <CardBody className="p-4">
              <div className="flex items-center gap-2 text-lg font-semibold mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M69.12,94.15,28.5,128l40.62,33.85a8,8,0,1,1-10.24,12.29l-48-40a8,8,0,0,1,0-12.29l48-40a8,8,0,1,1,10.24,12.3Zm176,27.7-48-40a8,8,0,1,0-10.24,12.3L227.5,128l-40.62,33.85a8,8,0,1,0,10.24,12.29l48-40a8,8,0,0,0,0-12.29ZM164.1,32.72a8,8,0,0,0-10.38,4.78l-64,176a8,8,0,0,0,4.78,10.38A8.14,8.14,0,0,0,97.34,224a8,8,0,0,0,7.59-5.5l64-176A8,8,0,0,0,164.1,32.72Z"></path>
                </svg>
                API Access
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-400 mb-2">API Key</p>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-800 px-2 py-1 rounded text-xs flex-1 font-mono truncate">
                      {showApiKey ? apiKey : "•".repeat(20)}
                    </code>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="bordered"
                      onPress={() => setShowApiKey(!showApiKey)}
                      className="border-gray-600"
                    >
                      {showApiKey ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M53.92,34.62A8,8,0,1,0,42.08,45.38L61.32,66.55C25,88.84,9.38,123.2,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208a127.11,127.11,0,0,0,52.07-10.83l22,24.21a8,8,0,1,0,11.84-10.76Zm47.33,75.84,41.67,45.85a32,32,0,0,1-41.67-45.85ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.16,133.16,0,0,1,25,128c4.69-8.79,19.66-33.39,47.35-49.38l18,19.75a48,48,0,0,0,63.66,70l14.73,16.2A112,112,0,0,1,128,192Zm6-95.43a8,8,0,0,1,3-15.72,48.16,48.16,0,0,1,38.77,42.64,8,8,0,0,1-7.22,8.71,6.39,6.39,0,0,1-.75,0,8,8,0,0,1-8-7.26A32.09,32.09,0,0,0,134,96.57Zm113.28,34.69c-.42.94-10.55,23.37-33.36,43.8a8,8,0,1,1-10.67-11.92A132.77,132.77,0,0,0,231.05,128a133.15,133.15,0,0,0-23.12-30.77C185.67,75.19,158.78,64,128,64a118.37,118.37,0,0,0-19.36,1.57A8,8,0,1,1,106,49.79,134,134,0,0,1,128,48c34.88,0,66.57,13.26,91.66,38.35,18.83,18.83,27.3,37.62,27.65,38.41A8,8,0,0,1,247.31,131.26Z"></path>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256">
                          <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128a133.33,133.33,0,0,1,23.07-30.75C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path>
                        </svg>
                      )}
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="bordered"
                      onPress={() => navigator.clipboard.writeText(apiKey || "")}
                      className="border-gray-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M216,32H88a8,8,0,0,0-8,8V80H40a8,8,0,0,0-8,8V216a8,8,0,0,0,8,8H168a8,8,0,0,0,8-8V176h40a8,8,0,0,0,8-8V40A8,8,0,0,0,216,32ZM160,208H48V96H160Zm48-48H176V88a8,8,0,0,0-8-8H96V48H208Z"></path>
                      </svg>
                    </Button>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-400 mb-2">Usage Guidelines</p>
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• Keep your API key secure</p>
                    <p>• Rate limit: 1000 req/hour</p>
                    <p>• Use HTTPS only</p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Connections Card */}
          <Card className="bg-background/50 backdrop-blur-md border border-gray-700">
            <CardBody className="p-4">
              <div className="flex items-center gap-2 text-lg font-semibold mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M144,80a64,64,0,1,0-64,64A64.07,64.07,0,0,0,144,80Zm-64,48a48,48,0,1,1,48-48A48.05,48.05,0,0,1,80,128Zm109.25-48h58.07a8,8,0,0,1,0,16H189.25a80.9,80.9,0,0,0-28.5-59.31,8,8,0,0,1,11.3-11.31A96.85,96.85,0,0,1,205.25,80ZM173.25,176a80.9,80.9,0,0,0,28.5-59.31,8,8,0,0,1,15.5,4.62A96.85,96.85,0,0,1,184,176Z"></path>
                </svg>
                Connections
              </div>

              <div className="space-y-3">
                <Button
                  color={user.discord_id ? "success" : "primary"}
                  variant="bordered"
                  disabled={user.discord_id ? true : false}
                  className="w-full border-gray-600 justify-start"
                  size="sm"
                  startContent={
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z"/>
                    </svg>
                  }
                >
                  {linkText}
                </Button>

                <Button
                  color="primary"
                  variant="bordered"
                  className="w-full border-gray-600 justify-start"
                  size="sm"
                  startContent={
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.627 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  }
                >
                  Connect GitHub
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Modals */}
        <PasswordModal
          open={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onSubmit={handlePasswordChange}
          loading={passwordLoading}
          success={passwordSuccess}
          error={passwordError}
        />

        <GoogleAuthModal
          open={showGoogleAuthModal}
          onClose={() => setShowGoogleAuthModal(false)}
        />
      </div>
    </div>
  );
}

// Composant Modal pour changer le mot de passe


// Composant principal
export default function Settings() {
  const isMobile = useIsMobile();
  const logic = useSettingsLogic();
  
  return isMobile ? (
    <SettingsMobile {...logic} />
  ) : (
    <SettingsDesktop {...logic} />
  );
}
