import React, { useState, useRef, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import { useRouter } from "next/router";
import CachedImage from "../components/utils/CachedImage";
import useIsMobile from "../hooks/useIsMobile";

const containerStyle: React.CSSProperties = {
  maxWidth: 500,
  margin: "60px auto",
  background: "#23232a",
  borderRadius: 12,
  boxShadow: "0 2px 12px rgba(0,0,0,0.25)",
  padding: "32px 24px",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  position: "relative",
};

const inputStyle: React.CSSProperties = {
  width: "auto",
  padding: "10px 12px",
  borderRadius: 6,
  border: "1px solid #444",
  background: "#18181c",
  color: "#fff",
  marginBottom: 18,
  fontSize: 16,
};

const labelStyle: React.CSSProperties = {
  alignSelf: "flex-start",
  marginBottom: 6,
  fontWeight: 600,
};

const buttonStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  background: "#5865F2",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer",
  marginTop: 12,
};

const avatarStyle: React.CSSProperties = {
  width: 132,
  height: 132,
  borderRadius: "50%",
  objectFit: "cover",
  marginBottom: 16,
  border: "2px solid #444",
};

const steamBtnStyle: React.CSSProperties = {
  // width: "260px",
  height: "48px",
  background: "linear-gradient(90deg, #1b2838 60%, #171a21 100%)",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
};

function ChangePasswordModal({
  open,
  onClose,
  onSubmit,
  loading,
  error,
  success,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => void;
  loading: boolean;
  error: string | null;
  success: string | null;
}) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  useEffect(() => {
    if (open) {
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [open]);
  if (!open) return null;
  return (
    <div className="shop-prompt-overlay">
      <div className="shop-prompt">
        <div className="shop-prompt-message">Change password</div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ oldPassword, newPassword, confirmPassword });
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            alignItems: "stretch",
            marginBottom: 8,
          }}
        >
          <label style={labelStyle}>Current password</label>
          <input
            type="password"
            style={{ ...inputStyle, marginBottom: 0, width: "256px" }}
            placeholder="Enter current password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <label style={labelStyle}>New password</label>
          <input
            type="password"
            style={{ ...inputStyle, marginBottom: 0, width: "256px" }}
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <label style={labelStyle}>Confirm new password</label>
          <input
            type="password"
            style={{ ...inputStyle, marginBottom: 0, width: "256px" }}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            required
          />
          <button
            className="shop-prompt-buy-btn"
            type="submit"
            disabled={loading}
            style={{ width: "280px", padding: "8px 18px" }}
          >
            {loading ? "Saving..." : "Change"}
          </button>
          <button
            className="shop-prompt-cancel-btn"
            type="button"
            onClick={onClose}
            style={{ width: "280px", padding: "8px 18px" }}
          >
            Cancel
          </button>
          {success && (
            <div style={{ color: "#4caf50", marginTop: 8 }}>{success}</div>
          )}
          {error && (
            <div style={{ color: "#ff5252", marginTop: 8 }}>{error}</div>
          )}
        </form>
      </div>
    </div>
  );
}

function GoogleAuthenticatorSetupModal({
  open,
  onClose,
  user,
}: {
  open: boolean;
  onClose: (success: boolean) => void;
  user: any;
}) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"generate" | "validate">("generate");
  const [key, setKey] = useState<any>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);


  useEffect(() => {
    if (open) {
      setStep("generate");
      setKey(null);
      setQrCode(null);
      setPasscode("");
      setError(null);
      setSuccess(null);
    }
  }, [open]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/authenticator/generateKey", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to generate key");
      setKey(data.key);
      setQrCode(data.qrCode);
      setStep("validate");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/authenticator/registerKey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, passcode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to validate key");
      setSuccess("Google Authenticator setup complete!");
      setStep("generate");
      user.haveAuthenticator = true; // Update user state
      onClose(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="shop-prompt-overlay">
      <div className="shop-prompt">
        <div className="shop-prompt-message">Setup Google Authenticator</div>
        {step === "generate" ? (
          <button
            style={{ ...buttonStyle, width: "100%" }}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Key & QR Code"}
          </button>
        ) : (
          <>
            {qrCode && (
              <div style={{ textAlign: "center", marginBottom: 12 }}>
                <CachedImage
                  src={qrCode}
                  alt="QR Code"
                  style={{ width: 180, height: 180 }}
                />
                <div style={{ fontSize: 14, marginTop: 8 }}>
                  Scan with Google Authenticator
                </div>
              </div>
            )}
            <form
              onSubmit={handleValidate}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <label style={labelStyle}>Enter passcode from app</label>
              <input
                type="text"
                style={inputStyle}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="123456"
                required
                maxLength={6}
                pattern="\d{6}"
              />
              <button
                type="submit"
                style={{ ...buttonStyle, width: "100%" }}
                disabled={loading}
              >
                {loading ? "Validating..." : "Validate"}
              </button>
              <button
                type="button"
                style={{ ...buttonStyle, width: "100%", background: "#444" }}
                onClick={() => { onClose(false) }}
              >
                Cancel
              </button>
            </form>
          </>
        )}
        {error && <div style={{ color: "#ff5252", marginTop: 8 }}>{error}</div>}
        {success && <div style={{ color: "#4caf50", marginTop: 8 }}>{success}</div>}
      </div>
    </div>
  );
}

function SecurityModal({
  open,
  onClose,
  user,
  setUser,
  passkeyLoading,
  passkeySuccess,
  passkeyError,
  handleRegisterPasskey,
  showGoogleAuthModal,
  setShowGoogleAuthModal,
  success,
  error,
  setError,
  setSuccess,
  router,
  linkText,
}: any) {
  if (!open) return null;
  return (
    <div className="shop-prompt-overlay">
      <div className="shop-prompt">
        <div className="shop-prompt-message">Security & Social Links</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Steam */}
          {!user?.steam_id ? (
            <button
              style={steamBtnStyle}
              onClick={() => router.push("/api/auth/steam")}
              disabled={user?.isStudio}
            >
              <span className="fab fa-steam" style={{ fontSize: "22px" }} />
              {linkText}
            </button>
          ) : (
            <button
              style={steamBtnStyle}
              onClick={async () => {
                if (confirm("Are you sure you want to unlink your Steam account?")) {
                  try {
                    const res = await fetch("/api/users/unlink-steam", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                    });
                    if (!res.ok) throw new Error("Failed to unlink Steam account");
                    setUser({ ...user, steam_id: null, steam_username: null, steam_avatar_url: null });
                  } catch (err: any) {
                    setError(err.message);
                  }
                }
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <CachedImage src={user?.steam_avatar_url} alt="Steam Avatar" style={{ width: 32, height: 32, borderRadius: "20%" }} />
                <span>Linked as <b>{user?.steam_username}</b></span>
              </div>
            </button>
          )}

          {/* Discord */}
          {!user?.discord_id ? (
            <button
              type="button"
              style={{
                width: "100%",
                height: "48px",
                background: "linear-gradient(90deg, #5865F2 60%, #404EED 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
              }}
              onClick={() => router.push("/auth/discord")}
              disabled={user?.isStudio}
            >
              <span className="fab fa-discord" style={{ fontSize: "22px" }} />
              Link Discord
            </button>
          ) : (
            <button
              type="button"
              style={{
                width: "100%",
                height: "48px",
                background: "linear-gradient(90deg, #5865F2 60%, #404EED 100%)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: 600,
                cursor: "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                opacity: 0.7,
              }}
              disabled
            >
              <span className="fab fa-discord" style={{ fontSize: "22px" }} />
              Discord linked
            </button>
          )}

          {/* Google */}
          {!user?.google_id ? (
            <button
              type="button"
              style={{
                width: "100%",
                height: "48px",
                background: "#fff",
                color: "#222",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
              }}
              onClick={() => router.push("/auth/google")}
              disabled={user?.isStudio}
            >
              <span className="fab fa-google" style={{ fontSize: "22px" }} />
              Link Google
            </button>
          ) : (
            <button
              type="button"
              style={{
                width: "100%",
                height: "48px",
                background: "#fff",
                color: "#222",
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: 600,
                cursor: "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                opacity: 0.7,
              }}
              disabled
            >
              <span className="fab fa-google" style={{ fontSize: "22px" }} />
              Google linked
            </button>
          )}

          {/* Passkey */}
          <button
            type="button"
            style={{ ...buttonStyle, background: "#222", color: "#fff" }}
            onClick={handleRegisterPasskey}
            disabled={passkeyLoading || !user}
          >
            {passkeyLoading ? "Registering..." : "Register Passkey"}
          </button>
          {passkeySuccess && <div style={{ color: "#4caf50" }}>{passkeySuccess}</div>}
          {passkeyError && <div style={{ color: "#ff5252" }}>{passkeyError}</div>}

          {/* Google Authenticator */}
          {user && !user.haveAuthenticator ? (
            <button
              type="button"
              style={{ ...buttonStyle, background: "#222", color: "#fff", marginTop: 0 }}
              onClick={() => setShowGoogleAuthModal(true)}
              disabled={!user}
            >
              Setup Google Authenticator
            </button>
          ) : (
            <button
              type="button"
              style={{ ...buttonStyle, background: "#222", color: "#fff", marginTop: 0 }}
              onClick={async () => {
                const choice = confirm("Are you sure you want to delete Google Authenticator? This will disable 2FA for your account.");
                if (choice) {
                  const res = await fetch("/api/authenticator/delete", { method: "POST", body: JSON.stringify({ userId: user.user_id }), headers: { "Content-Type": "application/json" } });
                  if (!res.ok) {
                    alert("Failed to delete Google Authenticator.");
                  } else {
                    user.haveAuthenticator = false;
                    setUser && setUser({ ...user });
                  }
                }
              }}
              disabled={!user}
            >
              Delete Google Authenticator
            </button>
          )}
          {success && <div style={{ color: "#4caf50", marginTop: 8 }}>{success}</div>}
          {error && <div style={{ color: "#ff5252", marginTop: 8 }}>{error}</div>}
          <button
            type="button"
            style={{ ...buttonStyle, background: "#444", marginTop: 16 }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function useSettingsLogic() {
  const { user, token, setUser } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState(user?.email || "");
  const [username, setUsername] = useState(user?.username || "");
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameSuccess, setUsernameSuccess] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const [showApiKey, setShowApiKey] = useState(false);
  const [avatar, setAvatar] = useState(user?.id ? `/avatar/${user.id}` : "/avatar/default.png");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkText, setLinkText] = useState("Link Steam Account");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Passkey registration state
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeySuccess, setPasskeySuccess] = useState<string | null>(null);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [showGoogleAuthModal, setShowGoogleAuthModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !user) return;
    setLinkText(
      typeof window !== "undefined" &&
        window.location.search.includes("from=launcher")
        ? "Go on website to link"
        : !user?.isStudio
        ? "Link Steam Account"
        : "Studio can't link Steam"
    );
  }, [user, linkText]);

  useEffect(() => {
    if (typeof document == "undefined") return;
    setTimeout(() => {
      if (
        document
          .querySelector("img[alt='Profile']")
          ?.getAttribute("src")
          ?.includes("default.png")
      ) {
        router.push("/login");
      }
    }, 2000);
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setAvatarFile(file);
    setAvatar(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const res = await fetch("/upload/avatar", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload avatar");
      setSuccess("Profile picture updated!");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setUsernameError(null);
    setUsernameSuccess(null);
  };

  const handleUsernameSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameLoading(true);
    setUsernameError(null);
    setUsernameSuccess(null);
    try {
      const res = await fetch("/api/users/change-username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update username");
      setUsernameSuccess("Username updated!");
      setUser && setUser({ ...user, username });
    } catch (e: any) {
      setUsernameError(e.message);
    } finally {
      setUsernameLoading(false);
    }
  };

  const handlePasswordChange = async ({
    oldPassword,
    newPassword,
    confirmPassword,
  }: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(null);
    try {
      if (!newPassword || !confirmPassword) {
        throw new Error("Please fill all password fields.");
      }
      if (newPassword !== confirmPassword) {
        throw new Error("New password and confirmation do not match.");
      }
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.message || "Error changing password"
        );
      setPasswordSuccess("Password updated!");
      setShowPasswordModal(false);
    } catch (e: any) {
      setPasswordError(e.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRegisterPasskey = async () => {
    setPasskeyLoading(true);
    setPasskeyError(null);
    setPasskeySuccess(null);
    try {
      const res = await fetch("/api/webauthn/register/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, username: user?.username, email: user?.email }),
      });
      if (!res.ok) throw new Error("Failed to get registration options");
      const options = await res.json();

      if (!options.authenticatorSelection) {
        options.authenticatorSelection = {
          residentKey: "required",
          userVerification: "required",
        };
      }
      options.requireResidentKey = true;

      if (typeof options.challenge === "string") {
        options.challenge = Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0));
      }
      if (typeof options.user.id === "string") {
        options.user.id = Uint8Array.from(atob(options.user.id), c => c.charCodeAt(0));
      }
      try {
        const cred = await navigator.credentials.create({ publicKey: options });
        if (!cred) throw new Error("Passkey creation failed");

        function bufferToBase64url(buf: ArrayBuffer): string {
          let str = btoa(String.fromCharCode(...new Uint8Array(buf)));
          return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        }

        const publicKeyCred = cred as PublicKeyCredential;
        const credential = {
          id: publicKeyCred.id,
          rawId: bufferToBase64url(publicKeyCred.rawId),
          type: publicKeyCred.type,
          response: {
            attestationObject: bufferToBase64url(
              (publicKeyCred.response as AuthenticatorAttestationResponse).attestationObject
            ),
            clientDataJSON: bufferToBase64url(
              (publicKeyCred.response as AuthenticatorAttestationResponse).clientDataJSON
            ),
          },
          clientExtensionResults: publicKeyCred.getClientExtensionResults(),
        };

        const verifyRes = await fetch("/api/webauthn/register/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential, userId: user?.id }),
        });
        if (!verifyRes.ok) throw new Error("Failed to register passkey");
        setPasskeySuccess("Passkey registered!");
      } catch (err) {
        throw new Error("Passkey registration failed");
      }
    } catch (e: any) {
      setPasskeyError(e.message);
    } finally {
      setPasskeyLoading(false);
    }
  };

  return {
    user,
    token,
    setUser,
    email,
    setEmail,
    username,
    setUsername,
    usernameLoading,
    usernameSuccess,
    usernameError,
    showApiKey,
    setShowApiKey,
    avatar,
    setAvatar,
    avatarFile,
    setAvatarFile,
    loading,
    setLoading,
    success,
    setSuccess,
    error,
    setError,
    fileInputRef,
    linkText,
    setLinkText,
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

function SettingsDesktop(props: ReturnType<typeof useSettingsLogic>) {
  const { user, token, setUser } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState(user?.email || "");
  const [username, setUsername] = useState(user?.username || "");
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameSuccess, setUsernameSuccess] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const [showApiKey, setShowApiKey] = useState(false);
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    setUsernameError(null);
    setUsernameSuccess(null);
  };

  const handleUsernameSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameLoading(true);
    setUsernameError(null);
    setUsernameSuccess(null);
    try {
      const res = await fetch("/api/users/change-username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update username");
      setUsernameSuccess("Username updated!");
      setUser && setUser({ ...user, username });
    } catch (e: any) {
      setUsernameError(e.message);
    } finally {
      setUsernameLoading(false);
    }
  };
  const [avatar, setAvatar] = useState(
    user?.id ? `/avatar/${user.id}` : "/avatar/default.png"
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [linkText, setLinkText] = useState("Link Steam Account");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Passkey registration state
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [passkeySuccess, setPasskeySuccess] = useState<string | null>(null);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [showGoogleAuthModal, setShowGoogleAuthModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !user) return;
    setLinkText(
      typeof window !== "undefined" &&
        window.location.search.includes("from=launcher")
        ? "Go on website to link"
        : !user?.isStudio
          ? "Link Steam Account"
          : "Studio can't link Steam"
    );
  }, [user, linkText]);

  useEffect(() => {
    if (typeof document == "undefined") return;
    setTimeout(() => {
      if (
        document
          .querySelector("img[alt='Profile']")
          ?.getAttribute("src")
          ?.includes("default.png")
      ) {
        // Do something with the document
        console.log("Default avatar detected, setting to user avatar");
        router.push("/login");
      }
    }, 2000);
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setAvatarFile(file);
    setAvatar(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const res = await fetch("/upload/avatar", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload avatar");
      setSuccess("Profile picture updated!");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async ({
    oldPassword,
    newPassword,
    confirmPassword,
  }: {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(null);
    try {
      if (!newPassword || !confirmPassword) {
        throw new Error("Veuillez remplir tous les champs de mot de passe.");
      }
      if (newPassword !== confirmPassword) {
        throw new Error(
          "Le nouveau mot de passe et la confirmation ne correspondent pas."
        );
      }
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.message || "Erreur lors du changement de mot de passe"
        );
      setPasswordSuccess("Mot de passe mis à jour !");
      setShowPasswordModal(false);
    } catch (e: any) {
      setPasswordError(e.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRegisterPasskey = async () => {
    setPasskeyLoading(true);
    setPasskeyError(null);
    setPasskeySuccess(null);
    try {
      // 1. Get registration options from backend
      const res = await fetch("/api/webauthn/register/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?.id, username: user?.username, email: user?.email }),
      });
      if (!res.ok) throw new Error("Failed to get registration options");
      const options = await res.json();

      // Ajoute les options pour credential discoverable si absent
      if (!options.authenticatorSelection) {
        options.authenticatorSelection = {
          residentKey: "required",
          userVerification: "required",
        };
      }
      // Optionnel, pour compatibilité
      options.requireResidentKey = true;

      if (typeof options.challenge === "string") {
        options.challenge = Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0));
      }
      if (typeof options.user.id === "string") {
        options.user.id = Uint8Array.from(atob(options.user.id), c => c.charCodeAt(0));
      }
      try {
        const cred = await navigator.credentials.create({ publicKey: options });
        if (!cred) throw new Error("Passkey creation failed");

        // Serialize credential for transport
        function bufferToBase64(buf) {
          return btoa(String.fromCharCode(...new Uint8Array(buf)));
        }

        function bufferToBase64url(buf: ArrayBuffer): string {
          // Convert ArrayBuffer to base64url string
          let str = btoa(String.fromCharCode(...new Uint8Array(buf)));
          // base64url: remplace + par -, / par _, retire les =
          return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
        }

        const publicKeyCred = cred as PublicKeyCredential;
        const credential = {
          id: publicKeyCred.id, // <-- déjà base64url, ne pas encoder
          rawId: bufferToBase64url(publicKeyCred.rawId), // <-- base64url
          type: publicKeyCred.type,
          response: {
            attestationObject: bufferToBase64url(
              (publicKeyCred.response as AuthenticatorAttestationResponse).attestationObject
            ),
            clientDataJSON: bufferToBase64url(
              (publicKeyCred.response as AuthenticatorAttestationResponse).clientDataJSON
            ),
          },
          clientExtensionResults: publicKeyCred.getClientExtensionResults(),
        };

        // Send credential to backend for verification
        const verifyRes = await fetch("/api/webauthn/register/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential, userId: user?.id }),
        });
        if (!verifyRes.ok) throw new Error("Failed to register passkey");
        setPasskeySuccess("Passkey registered!");
      } catch (err) {
        console.error("Passkey registration error:", err);
        throw new Error("Passkey registration failed");
      }
    } catch (e: any) {
      setPasskeyError(e.message);
    } finally {
      setPasskeyLoading(false);
    }
  };

  function handleSave(): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="container" style={containerStyle}>
      <h2 style={{ marginBottom: 32 }}>Settings</h2>
      <button
        style={{
          position: "absolute",
          top: 24,
          right: 24,
          background: "none",
          border: "none",
          color: user?.isStudio ? "#aaa" : "#fff",
          cursor: "pointer",
          fontSize: 22,
          zIndex: 2,
        }}
        onClick={() => setShowPasswordModal(true)}
        disabled={user?.isStudio}
        type="button"
        title="Change password"
      >
        <i className="fas fa-key" aria-hidden="true" />
      </button>
      {/* Bouton sécurité */}
      {!user?.isStudio && (
        <button
          style={{
            position: "absolute",
            top: 24,
            right: 64,
            background: "none",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            fontSize: 22,
            zIndex: 2,
          }}
          onClick={() => setShowSecurityModal(true)}
          type="button"
          title="Security & Social Links"
        >
          <i className="fas fa-link" aria-hidden="true" />
        </button>
      )}
      <div style={{ display: "flex", flexDirection: "row", gap: 24 }}>
        <div>
          <CachedImage
            src={avatar}
            alt="Profile"
            style={avatarStyle}
            onClick={() => fileInputRef.current?.click()}
            title="Change profile picture"
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
          {avatarFile && (
            <button
              type="button"
              style={{ ...buttonStyle, marginTop: 8, background: "#444" }}
              onClick={handleAvatarUpload}
              disabled={loading}
            >
              {loading ? "Uploading..." : "Upload new picture"}
            </button>
          )}
        </div>
        <div>
          <form
            onSubmit={handleUsernameSave}
            style={{
              display: "flex",
              gap: 8,
              // alignItems: "center",
              marginTop: 0,
              marginBottom: 8,
            }}
          >
            <label style={labelStyle}>Username</label>
            <input
              type="text"
              style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
              value={username}
              onChange={handleUsernameChange}
              autoComplete="username"
              minLength={3}
              maxLength={32}
              required
              disabled={usernameLoading}
            />
            <button
              type="submit"
              style={{
                ...buttonStyle,
                width: "280px",
                padding: "8px 18px",
                // marginBottom: 16,
              }}
              disabled={usernameLoading}
            >
              {usernameLoading ? "Saving..." : "Save"}
            </button>
          </form>

          {usernameSuccess && (
            <div style={{ color: "#4caf50", marginTop: 2 }}>
              {usernameSuccess}
            </div>
          )}
          {usernameError && (
            <div style={{ color: "#ff5252", marginTop: 2 }}>
              {usernameError}
            </div>
          )}
        </div>{" "}
      </div>
      {user && (
        <div style={{ marginTop: 32, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <label style={{ ...labelStyle, alignSelf: "" }}>API Key</label>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexDirection: "column" }}>
            <code
              style={{
                background: "#444",
                borderRadius: 4,
                padding: "6px 12px",
                fontWeight: 500,
                fontSize: 15,
                userSelect: showApiKey ? "all" : "none",
                cursor: showApiKey ? "pointer" : "default",
                minWidth: 180,
              }}
              onClick={() => {
                if (showApiKey) navigator.clipboard.writeText(token || "");
              }}
              title={showApiKey ? "Click to copy" : "Click Show"}
            >
              {showApiKey ? token : "*".repeat(Math.max(8, String(token || "").length))}
            </code>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 14,
                  textDecoration: "underline",
                  opacity: 0.7,
                }}
                onClick={() => setShowApiKey((v) => !v)}
              >
                {showApiKey ? "Hide" : "Show"}
              </button>
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 14,
                  textDecoration: "underline",
                  opacity: 0.7,
                }}
                onClick={() => navigator.clipboard.writeText(token || "")}
                disabled={!showApiKey}
              >
                Copy
              </button>
            </div>
          </div>
          <div style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>
            This key allows you to use the API on your behalf.
          </div>
        </div>
      )}
      {user && !user?.isStudio ? (
        <>
          <ChangePasswordModal
            open={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
            onSubmit={handlePasswordChange}
            loading={passwordLoading}
            error={passwordError}
            success={passwordSuccess}
          />
        </>
      ) : null}
      {/* {
        <>
          <div
            style={{
              width: "100%",
              textAlign: "center",
              margin: "24px 0 16px 0",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div style={{ flex: 1, height: 1, background: "#444" }} />
          </div>
        </>
      } */}
      <div style={{ marginTop: 32 }} />
      <GoogleAuthenticatorSetupModal
        open={showGoogleAuthModal}
        onClose={(success) => { setShowGoogleAuthModal(false); if (success) { user.haveAuthenticator = true; setUser({ ...user }); } }}
        user={user}
      />
      <SecurityModal
        open={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        user={user}
        setUser={setUser}
        passkeyLoading={passkeyLoading}
        passkeySuccess={passkeySuccess}
        passkeyError={passkeyError}
        handleRegisterPasskey={handleRegisterPasskey}
        showGoogleAuthModal={showGoogleAuthModal}
        setShowGoogleAuthModal={setShowGoogleAuthModal}
        success={success}
        error={error}
        setError={setError}
        setSuccess={setSuccess}
        router={router}
        linkText={linkText}
      />
    </div>
  );
}

function SettingsMobile(props: ReturnType<typeof useSettingsLogic>) {
  // Version mobile : layout vertical, padding réduit, boutons plus gros, police plus petite
  // Adaptez les styles pour mobile
  const {
    user, token, setUser, email, setEmail, username, setUsername, usernameLoading, usernameSuccess, usernameError,
    showApiKey, setShowApiKey, avatar, avatarFile, loading, success, error, fileInputRef, linkText,
    showPasswordModal, setShowPasswordModal, passwordLoading, passwordSuccess, passwordError,
    handleAvatarChange, handleAvatarUpload, handleUsernameChange, handleUsernameSave, handlePasswordChange,
    passkeyLoading, passkeySuccess, passkeyError, handleRegisterPasskey,
    showGoogleAuthModal, setShowGoogleAuthModal, showSecurityModal, setShowSecurityModal, router
  } = props;

  return (
    <div className="container" style={{
      maxWidth: 420,
      margin: "18px",
      background: "#23232a",
      borderRadius: 10,
      boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
      padding: "18px 8px",
      color: "#fff",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      position: "relative",
      fontSize: "0.98em"
    }}>
      <h2 style={{ marginBottom: 18, fontSize: "1.2em" }}>Settings</h2>
      <button
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          background: "none",
          border: "none",
          color: user?.isStudio ? "#aaa" : "#fff",
          cursor: "pointer",
          fontSize: 20,
          zIndex: 2,
        }}
        onClick={() => setShowPasswordModal(true)}
        disabled={user?.isStudio}
        type="button"
        title="Change password"
      >
        <i className="fas fa-key" aria-hidden="true" />
      </button>
      {!user?.isStudio && (
        <button
          style={{
            position: "absolute",
            top: 12,
            right: 48,
            background: "none",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            fontSize: 20,
            zIndex: 2,
          }}
          onClick={() => setShowSecurityModal(true)}
          type="button"
          title="Security & Social Links"
        >
          <i className="fas fa-link" aria-hidden="true" />
        </button>
      )}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <CachedImage
          src={avatar}
          alt="Profile"
          style={{
            width: 90,
            height: 90,
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: 8,
            border: "2px solid #444",
          }}
          onClick={() => fileInputRef.current?.click()}
          title="Change profile picture"
        />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleAvatarChange}
        />
        {avatarFile && (
          <button
            type="button"
            style={{
              width: "100%",
              padding: "8px",
              background: "#444",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: "1em",
              fontWeight: 600,
              marginTop: 4,
            }}
            onClick={handleAvatarUpload}
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload new picture"}
          </button>
        )}
        <form
          onSubmit={handleUsernameSave}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 6,
            alignItems: "stretch",
            marginTop: 0,
            marginBottom: 8,
            width: "100%",
          }}
        >
          <label style={{ fontWeight: 600, marginBottom: 2 }}>Username</label>
          <input
            type="text"
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: 6,
              border: "1px solid #444",
              background: "#18181c",
              color: "#fff",
              fontSize: "1em",
              marginBottom: 0,
            }}
            value={username}
            onChange={handleUsernameChange}
            autoComplete="username"
            minLength={3}
            maxLength={32}
            required
            disabled={usernameLoading}
          />
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "8px",
              background: "#5865F2",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: "1em",
              fontWeight: 600,
              marginTop: 6,
            }}
            disabled={usernameLoading}
          >
            {usernameLoading ? "Saving..." : "Save"}
          </button>
        </form>
        {usernameSuccess && (
          <div style={{ color: "#4caf50", marginTop: 2 }}>{usernameSuccess}</div>
        )}
        {usernameError && (
          <div style={{ color: "#ff5252", marginTop: 2 }}>{usernameError}</div>
        )}
      </div>
      {user && (
        <div style={{ marginTop: 18, width: "100%", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <label style={{ fontWeight: 600, marginBottom: 2 }}>API Key</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: "column" }}>
            <code
              style={{
                background: "#444",
                borderRadius: 4,
                padding: "6px 12px",
                fontWeight: 500,
                fontSize: 14,
                userSelect: showApiKey ? "all" : "none",
                cursor: showApiKey ? "pointer" : "default",
                minWidth: 120,
              }}
              onClick={() => {
                if (showApiKey) navigator.clipboard.writeText(token || "");
              }}
              title={showApiKey ? "Click to copy" : "Click Show"}
            >
              {showApiKey ? token : "*".repeat(Math.max(8, String(token || "").length))}
            </code>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 13,
                  textDecoration: "underline",
                  opacity: 0.7,
                }}
                onClick={() => setShowApiKey((v) => !v)}
              >
                {showApiKey ? "Hide" : "Show"}
              </button>
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 13,
                  textDecoration: "underline",
                  opacity: 0.7,
                }}
                onClick={() => navigator.clipboard.writeText(token || "")}
                disabled={!showApiKey}
              >
                Copy
              </button>
            </div>
          </div>
          <div style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>
            This key allows you to use the API on your behalf.
          </div>
        </div>
      )}
      {user && !user?.isStudio ? (
        <>
          {/* Password Modal */}
          <ChangePasswordModal
            open={showPasswordModal}
            onClose={() => setShowPasswordModal(false)}
            onSubmit={handlePasswordChange}
            loading={passwordLoading}
            error={passwordError}
            success={passwordSuccess}
          />
        </>
      ) : null}
      <div style={{ marginTop: 18 }} />
      <GoogleAuthenticatorSetupModal
        open={showGoogleAuthModal}
        onClose={(success) => { setShowGoogleAuthModal(false); if (success) { user.haveAuthenticator = true; setUser({ ...user }); } }}
        user={user}
      />
      <SecurityModal
        open={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        user={user}
        setUser={setUser}
        passkeyLoading={passkeyLoading}
        passkeySuccess={passkeySuccess}
        passkeyError={passkeyError}
        handleRegisterPasskey={handleRegisterPasskey}
        showGoogleAuthModal={showGoogleAuthModal}
        setShowGoogleAuthModal={setShowGoogleAuthModal}
        success={success}
        error={error}
        setError={props.setError}
        setSuccess={props.setSuccess}
        router={router}
        linkText={linkText}
      />
    </div>
  );
}

export default function Settings() {
  const isMobile = useIsMobile();
  const logic = useSettingsLogic();
  return isMobile ? <SettingsMobile {...logic} /> : <SettingsDesktop {...logic} />;
}
