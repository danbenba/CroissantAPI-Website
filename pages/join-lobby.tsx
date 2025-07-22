import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import useAuth from "../hooks/useAuth";

const JoinLobbyPage = () => {
  const router = useRouter();
  const { lobbyId } = router.query;
  const [status, setStatus] = useState("pending");
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    if (typeof lobbyId === "string" && lobbyId) {
      fetch(`/api/lobbies/${lobbyId}/join`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(async (res) => {
          setStatus(res.ok ? "success" : "error");
        })
        .catch(() => setStatus("error"));
    }
  }, [lobbyId]);

  if (!lobbyId) {
    return <div>No lobbyId found in URL.</div>;
  }

  if (status === "pending") return <div>Joining lobby...</div>;
  if (status === "success") return <div>Lobby joined!</div>;
  return <div>Failed to join lobby.</div>;
};

export default JoinLobbyPage;
