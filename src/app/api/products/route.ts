import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { getUserSession } from "@/src/lib/auth";

export async function GET() {
  try {
    const session = await getUserSession();
    const isAdmin = session?.role === "ADMIN";
    const isStaffOrAdmin = session?.role === "ADMIN" || session?.role === "STAFF";

    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    // If customer or guest: HIDE the store cost prices
    const sanitizedProducts = products.map((p) => ({
      ...p,
      costPrice: isAdmin ? p.costPrice : undefined,
    }));

    const totalStockUnits = products.reduce((acc, item) => acc + item.quantity, 0);
    const totalInventoryValue = products.reduce(
      (acc, item) => acc + item.sellingPrice * item.quantity,
      0
    );
    const lowStockCount = products.filter(
      (item) => item.quantity <= item.lowStockAlert
    ).length;

    return NextResponse.json({
      products: sanitizedProducts,
      userRole: session?.role || "GUEST",
      summary: isStaffOrAdmin
        ? { totalStockUnits, totalInventoryValue, lowStockCount }
        : null, // Customers do not see store valuation totals
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // 1. Verify who is trying to add the product
    const session = await getUserSession();

    if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
      return NextResponse.json(
        { error: "Access Denied: Only Store Admin and Staff can add or modify products" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { name, sku, category, costPrice, sellingPrice, quantity, lowStockAlert, description } = body;

    if (!name || !sku || !category || sellingPrice === undefined || quantity === undefined) {
      return NextResponse.json(
        { error: "Missing required product fields" },
        { status: 400 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        sku,
        category,
        costPrice: parseFloat(costPrice || 0),
        sellingPrice: parseFloat(sellingPrice),
        quantity: parseInt(quantity, 10),
        lowStockAlert: parseInt(lowStockAlert || 5, 10),
        description: description || null,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Product SKU code already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
