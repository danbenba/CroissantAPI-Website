import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Success() {
    const router = useRouter();
    const [redirected, setRedirected] = useState(false);

    useEffect(() => {
        if (typeof document !== "undefined" && !redirected) {
            const cookies = document.cookie.split(";").map(c => c.trim());
            const hasFromApp = cookies.some(c => c === "from=app");
            if (hasFromApp && router.asPath.indexOf("?from=app") === -1) {
                setRedirected(true);
                router.push(`${router.pathname}?from=launcher`);
            }
        }
    }, [router, redirected]);

    return (
        <main>
            <div className="container">
                <h2>Thank you for your purchase!</h2>
                <div className="indent">
                    <p>
                        Your transaction was successful. Your credits have been added to your account.
                    </p>
                    <p>
                        If you have any questions or need assistance, please contact our support team.
                    </p>
                </div>
                <h3>What would you like to do next?</h3>
                <div className="indent">
                    <ul>
                        <li>
                            <Link href="/">Return to Home</Link>
                        </li>
                        <li>
                            <Link href="/dashboard">Go to Dashboard</Link>
                        </li>
                        <li>
                            <Link href="/contact">Contact Support</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </main>
    );
}
