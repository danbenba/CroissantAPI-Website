
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
  alignItems: "center"
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 6,
  border: "1px solid #444",
  background: "#18181c",
  color: "#fff",
  marginBottom: 18,
  fontSize: 16
};

const labelStyle: React.CSSProperties = {
  alignSelf: "flex-start",
  marginBottom: 6,
  fontWeight: 600
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
  marginTop: 12
};

const avatarStyle: React.CSSProperties = {
  width: 96,
  height: 96,
  borderRadius: "50%",
  objectFit: "cover",
  marginBottom: 16,
  border: "2px solid #444"
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
  marginBottom: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px"
};


export default function Settings() {
  const { user, token, setUser } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState(user?.email || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatar, setAvatar] = useState(user?.avatar ? `https://croissant-api.fr/avatar/${user.id}` : "/avatar/default.png");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if(typeof document == "undefined") return;
    setTimeout(()=>{
      if(document.querySelector("img[alt='Profile']")?.getAttribute("src")?.includes("default.png")) {
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
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      if (!res.ok) throw new Error("Failed to upload avatar");
      setSuccess("Profile picture updated!");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Update email
      if (email && email !== user?.email) {
        const res = await fetch("/api/users/update-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ email })
        });
        if (!res.ok) throw new Error("Failed to update email");
      }
      // Update password (if any field is filled)
      if (newPassword || confirmPassword) {
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
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ oldPassword, newPassword, confirmPassword })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to update password");
      }
      setSuccess("Settings updated!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={containerStyle}>
      <h2 style={{ marginBottom: 32 }}>Settings</h2>
      <form style={{ width: "100%", maxWidth: 340 }} onSubmit={handleSave}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
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
            <button type="button" style={{ ...buttonStyle, marginTop: 8, background: "#444" }} onClick={handleAvatarUpload} disabled={loading}>
              {loading ? "Uploading..." : "Upload new picture"}
            </button>
          )}
        </div>
        <div style={{ marginTop: 24 }}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            style={inputStyle}
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required
            disabled={true}
          />
        </div>
        <div>
          <label style={labelStyle}>Current Password</label>
          <input
            type="password"
            style={inputStyle}
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Enter your current password"
          />
        </div>
        <div>
          <label style={labelStyle}>New Password</label>
          <input
            type="password"
            style={inputStyle}
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="Enter new password"
          />
        </div>
        <div>
          <label style={labelStyle}>Confirm New Password</label>
          <input
            type="password"
            style={inputStyle}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="Confirm new password"
          />
        </div>
        <button type="submit" style={buttonStyle} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
        {!user?.steam_id ? (
          <button style={steamBtnStyle} onClick={(event) => {
            event.preventDefault();
            router.push("/api/auth/steam");
          }}>
            <span className="fab fa-steam" style={{
              fontSize: "22px"
            }} aria-hidden="true" />
            Link Steam Account
          </button>
        ) : (
          <button style={steamBtnStyle} onClick={(event) => {
            event.preventDefault();
            confirm("Are you sure you want to unlink your Steam account?") &&
            fetch("/api/users/unlink-steam", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              }
            })
              .then(res => {
                if(!res.ok) throw new Error("Failed to unlink Steam account");
                return res.json();
              })
              .then(data => {
                  setUser({ ...user, steam_id: null, steam_username: null, steam_avatar_url: null });
              })
              .catch(err => setError(err.message)); 
            // router.push("/api/auth/steam");
          }}>
            {/* <span className="fab fa-steam" style={{
              fontSize: "22px"
            }} aria-hidden="true" /> */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <img src={user?.steam_avatar_url} alt="Steam Avatar" style={{ width: 32, height: 32, borderRadius: "20%" }} />
              <span style={{ fontWeight: "normal" }}>
                Linked as <b>{user?.steam_username}</b>
              </span>
            </div>
          </button>
        )}

        {success && <div style={{ color: "#4caf50", marginTop: 16 }}>{success}</div>}
        {error && <div style={{ color: "#ff5252", marginTop: 16 }}>{error}</div>}
      </form>
    </div>
  );
}