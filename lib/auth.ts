"use client"

import { useEffect, useState } from "react"

export function useUserRole() {
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    // Read role from cookie (client-side only; not secure for decisions, but useful for UI)
    const cookie = document.cookie
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("role="))
    if (cookie) setRole(decodeURIComponent(cookie.split("=")[1]))
  }, [])

  return role
}


