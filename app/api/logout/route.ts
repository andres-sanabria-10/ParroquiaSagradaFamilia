import { NextResponse } from "next/server"

export async function POST() {
  const res = NextResponse.json({ message: "ok" })
  res.cookies.set("tokenSession", "", { path: "/", maxAge: 0 })
  res.cookies.set("role", "", { path: "/", maxAge: 0 })
  return res
}


