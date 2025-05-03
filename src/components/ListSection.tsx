import React from "react";
import { ReactNode } from "react";

import Section from "./Section";

type ListSectionProps = {
    title: string;
    description?: string;
    items: ReactNode[];
};

export default function({ title, description, items }: ListSectionProps) {
    return (
        <Section title={title}>
            {description && <p>{description}</p>}
            <ul>
                {items.map((item, i) => (
                    <li key={i}>{item}</li>
                ))}
            </ul>
        </Section>
    );
}