import React from "react";
import { ReactNode } from "react";

type SectionProps = {
    title: string;
    children: ReactNode;
};

export default function({ title, children }: SectionProps) {
    return (
        <>
            <h3>{title}</h3>
            <div className="indent">{children}</div>
        </>
    );
}