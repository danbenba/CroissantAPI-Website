import useAuth from "../../../../hooks/useAuth";

const endpoint = "/api"

export default async function(token: string, callback: () => void) {
  await fetch(endpoint + "/users/@me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }).then((res) => {
    if (res.status === 401) {
      localStorage.removeItem("token");
      // window.location.reload();
    }
    return res.json();
  }).then((data) => {
    localStorage.setItem("verificationKey", data.verificationKey);
    window.me = data;
    callback();
  });
}