import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    const totalStockUnits = products.reduce((acc, item) => acc + item.quantity, 0);
    const totalInventoryValue = products.reduce(
      (acc, item) => acc + item.sellingPrice * item.quantity,
      0
    );
    const lowStockCount = products.filter(
      (item) => item.quantity <= item.lowStockAlert
    ).length;

    return NextResponse.json({
      products,
      summary: {
        totalStockUnits,
        totalInventoryValue,
        lowStockCount,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, sku, category, costPrice, sellingPrice, quantity, lowStockAlert, description } = body;

    if (!name || !sku || !category || sellingPrice === undefined || quantity === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
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
        { error: "Product SKU already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
