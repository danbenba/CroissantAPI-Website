let page = null;
let croissantWebsiteOrigin = "https://croissant-api.fr";

document.addEventListener("DOMContentLoaded", () => {
  console.log("OAuth2 script loaded");
  const oauthBtn = document.querySelector(".croissant-oauth2-btn");
  oauthBtn.style = style =
    "display:inline-flex;align-items:center;gap:8px;padding:8px 16px;font-size:1rem;border-radius:6px;border:none;background:#333;color:#fff;cursor:pointer;";
  oauthBtn.addEventListener("click", () => {
    const clientId = oauthBtn.getAttribute("client_id");
    const redirectUri = location.origin;
    // console.log("OAuth2 button clicked", clientId);
    page = window.open(
      `${croissantWebsiteOrigin}/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}`,
      "_oauth2",
      "width=600,height=600"
    );
  });
});

function lookForCode() {
  requestAnimationFrame(lookForCode);
  if (!page || page.closed) return;
  try {
    const code = new URL(page.location.href).searchParams.get("code");
    if (code) {
      page.close();
      const oauthBtn = document.querySelector(".croissant-oauth2-btn");
      const clientId = oauthBtn.getAttribute("client_id");
      fetch(
        `${croissantWebsiteOrigin}/api/oauth2/user?code=${code}&client_id=${clientId}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            console.error("Error fetching user by code:", data.error);
            return;
          }
          // console.log("User data received:", data);
          const user = data;
          console.log("User data:", user);
        });
    }
  } catch (e) {
    // console.error("Error checking for OAuth2 code:", e);
  }
}

lookForCode();
