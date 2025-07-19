import React, { Component, useEffect } from "react";
import Link from "next/link";
import SearchBar from "../../../components/Searchbar";
import useAuth from "../../../hooks/useAuth";

const Navbar: React.FC = () => {
    const { user, token } = useAuth();
    if (!token) {
        return null; // or a loading spinner
    }

    useEffect(() => {
        document.title = "Home Page | Croissant";
        // document.getElementById("my-balance")!.innerText = window.me.balance.toString();
    }, []);

    return (
        <div className="navbar-fixed">
            <header>
                {/* <h1>Croissant Inventory System</h1> */}
                <nav className="navbar-nav">
                    <div className="links-group">
                        <Link href="/launcher/home">Library</Link>
                        <Link href="/launcher/shop">Shop</Link>
                        <Link href="/oauth2/apps?from=launcher">OAuth2</Link>
                        <div className="create-dropdown">
                            Create
                            <div className="create-dropdown-content">
                                <Link href="/launcher/dev-zone/my-games">My Games</Link>
                                <Link href="/launcher/dev-zone/my-items">My Items</Link>
                                <hr />
                                <Link href="/launcher/dev-zone/create-game">Create Game</Link>
                                <Link href="/launcher/dev-zone/create-item">Create Item</Link>
                            </div>
                        </div>
                    </div>
                    <SearchBar />
                    <div className="navbar-user-group">
                        <Link href="/launcher/buy-credits" style={{ textDecoration: "none" }}>
                            <div className="navbar-credits">
                                <img src="/launcher/credit.png" className="navbar-credit-img" />
                                <div className="navbar-balance">
                                    <span id="my-balance">{user?.balance}</span>
                                </div>
                            </div>
                        </Link>
                        <Link href="/profile?from=launcher" style={{ textDecoration: "none" }}>
                            <img
                                className="navbar-avatar"
                                src={`https://croissant-api.fr/avatar/${user?.id}`}
                                style={{ objectFit: "cover" }}
                            />
                        </Link>
                        <button className="method navbar-logout-btn"
                            onClick={() => {
                                localStorage.removeItem("token");
                                localStorage.removeItem("verificationKey");
                                // location.reload();
                            }}
                        ><i className="fa fa-sign-out"></i></button>
                    </div>
                </nav>
            </header>
        </div>
    );
};

export default Navbar;