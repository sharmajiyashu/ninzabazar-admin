import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    const { id, status } = await req.json();

    if (!id || !["ACTIVE", "SUSPENDED", "BANNED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid user ID or status." },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Failed to update user status:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
