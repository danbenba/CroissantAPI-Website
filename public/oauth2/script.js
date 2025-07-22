let page = null;
let croissantWebsiteOrigin = "https://croissant-api.fr";

document.addEventListener("DOMContentLoaded", () => {
  console.log("OAuth2 script loaded");
  const oauthBtn = document.querySelector(".croissant-oauth2-btn");
  if (!oauthBtn) {
    console.error("OAuth2 button not found");
    return;
  }
  if (location.origin === croissantWebsiteOrigin) {
    console.warn(
      "OAuth2 script loaded from a different origin than expected:",
      location.origin
    );
  } else {
    oauthBtn.style.display = "inline-flex";
    oauthBtn.style.alignItems = "center";
    oauthBtn.style.gap = "8px";
    oauthBtn.style.padding = "8px 16px";
    oauthBtn.style.fontSize = "1rem";
    oauthBtn.style.borderRadius = "6px";
    oauthBtn.style.border = "none";
    oauthBtn.style.background = "#333";
    oauthBtn.style.color = "#fff";
    oauthBtn.style.cursor = "pointer";
    oauthBtn.addEventListener("click", () => {
      const clientId = oauthBtn.getAttribute("data-client_id");
      const redirectUri = location.origin;
      page = window.open(
        `${croissantWebsiteOrigin}/oauth2/auth?client_id=${clientId}&redirect_uri=${redirectUri}`,
        "_oauth2",
        "width=600,height=600"
      );
    });
  }
});

function lookForCode() {
  requestAnimationFrame(lookForCode);
  if (!page || page.closed) return;
  try {
    const code = new URL(page.location.href).searchParams.get("code");
    if (code) {
      page.close();
      const oauthBtn = document.querySelector(".croissant-oauth2-btn");
      const clientId = oauthBtn.getAttribute("data-client_id");
      fetch(
        `${croissantWebsiteOrigin}/api/oauth2/user?code=${code}&client_id=${clientId}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            console.error("Error fetching user by code:", data.error);
            return;
          }
          const user = data;
          const callback = oauthBtn.getAttribute("data-callback");
          if (callback) {
            eval(`(${callback})(user)`);
          }
        });
    }
  } catch (e) {
  }
}

lookForCode();
