import React, { useState, useRef, useEffect } from "react";
import useAuth from "../hooks/useAuth";
import { useRouter } from "next/router";

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

export default function Settings() {
  const { user, token, setUser } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState(user?.email || "");
  const [username, setUsername] = useState(user?.username || "");
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [usernameSuccess, setUsernameSuccess] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
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
      <div style={{ display: "flex", flexDirection: "row", gap: 24 }}>
        <div>
          <img
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
      {
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
          <form
            style={{
              width: "100%",
              maxWidth: 340,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
            onSubmit={handleSave}
          >
            {!user?.steam_id ? (
              <button
                style={steamBtnStyle}
                onClick={(event) => {
                  event.preventDefault();
                  if (
                    user?.isStudio ||
                    (typeof window !== "undefined" &&
                      window.location.search.includes("from=launcher"))
                  )
                    return;
                  if (
                    typeof window !== "undefined" &&
                    window.location.search.includes("from=launcher")
                  )
                    return;
                  event.preventDefault();
                  router.push("/api/auth/steam");
                }}
                disabled={
                  typeof window !== "undefined" &&
                  window.location.search.includes("from=launcher")
                }
              >
                <span
                  className="fab fa-steam"
                  style={{ fontSize: "22px" }}
                  aria-hidden="true"
                />
                {linkText}
              </button>
            ) : (
              <button
                style={steamBtnStyle}
                onClick={(event) => {
                  event.preventDefault();
                  if (
                    typeof window !== "undefined" &&
                    window.location.search.includes("from=launcher")
                  )
                    return;
                  confirm(
                    "Are you sure you want to unlink your Steam account?"
                  ) &&
                    fetch("/api/users/unlink-steam", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                    })
                      .then((res) => {
                        if (!res.ok)
                          throw new Error("Failed to unlink Steam account");
                        return res.json();
                      })
                      .then((data) => {
                        setUser({
                          ...user,
                          steam_id: null,
                          steam_username: null,
                          steam_avatar_url: null,
                        });
                      })
                      .catch((err) => setError(err.message));
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <img
                    src={user?.steam_avatar_url}
                    alt="Steam Avatar"
                    style={{ width: 32, height: 32, borderRadius: "20%" }}
                  />
                  <span style={{ fontWeight: "normal" }}>
                    Linked as <b>{user?.steam_username}</b>
                  </span>
                </div>
              </button>
            )}

            {success && (
              <div style={{ color: "#4caf50", marginTop: 16 }}>{success}</div>
            )}
            {error && (
              <div style={{ color: "#ff5252", marginTop: 16 }}>{error}</div>
            )}
          </form>
        </>
      }
    </div>
  );
}
