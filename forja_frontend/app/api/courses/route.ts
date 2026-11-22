import { NextRequest } from "next/server";
import { proxyForja } from "@/lib/serverApi";
export async function GET(request: NextRequest) {
  return proxyForja(request, "/course", "GET");
}

export async function POST(request: NextRequest) {
  return proxyForja(request, "/course/create", "POST");
}
