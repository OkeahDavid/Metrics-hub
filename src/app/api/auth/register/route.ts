import prisma from "@/lib/db";
import bcrypt from "bcrypt";
import { handleApiError } from "@/lib/error-handler";
import { createCreatedResponse } from "@/lib/api-response";

// Define proper types for register request
interface RegisterRequest {
  username: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body as RegisterRequest;

    // Validate inputs
    if (!username || !password) {
      return handleApiError(
        new Error("Missing required fields"),
        "Username and password are required"
      );
    }

    if (username.length < 3) {
      return handleApiError(
        new Error("Username too short"),
        "Username must be at least 3 characters long"
      );
    }

    if (password.length < 8) {
      return handleApiError(
        new Error("Password too short"),
        "Password must be at least 8 characters long"
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return handleApiError(
        new Error("Username already exists"),
        "This username is already taken"
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

    // Use standardized created response
    return createCreatedResponse(
      { 
        id: user.id, 
        username: user.username,
        createdAt: user.createdAt 
      },
      "User registered successfully"
    );
  } catch (error) {
    return handleApiError(error, "Failed to register user");
  }
}