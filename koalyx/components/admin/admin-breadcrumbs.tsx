"use client"

import { useRouter } from "next/navigation"
import { Breadcrumbs, BreadcrumbItem } from "@heroui/react"

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: string
}

interface AdminBreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function AdminBreadcrumbs({ items, className = "" }: AdminBreadcrumbsProps) {
  const router = useRouter()

  return (
    <Breadcrumbs className={`mb-8 ${className}`}>
      {items.map((item, index) => (
        <BreadcrumbItem
          key={index}
          onPress={item.href ? () => router.push(item.href! as any) : undefined}
          className={
            index === items.length - 1
              ? "text-purple-400" // Dernier élément (actuel)
              : "text-gray-400 hover:text-white cursor-pointer" // Éléments navigables
          }
        >
          {item.icon && <i className={`${item.icon} mr-2`}></i>}
          {item.label}
        </BreadcrumbItem>
      ))}
    </Breadcrumbs>
  )
}
