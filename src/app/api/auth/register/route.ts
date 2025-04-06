import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Validate inputs
    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if this is the admin user
    const isAdmin = 
      username === process.env.ADMIN_USERNAME && 
      password === process.env.ADMIN_PASSWORD;

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        isSuperUser: isAdmin, // Set superuser based on admin credentials
      },
    });

    return NextResponse.json(
      { 
        id: user.id, 
        username: user.username,
        createdAt: user.createdAt 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "Failed to register user" },
      { status: 500 }
    );
  }
}