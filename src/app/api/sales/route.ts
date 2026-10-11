import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { getUserSession } from "@/src/lib/auth";

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, role: true } },
        items: {
          include: {
            product: { select: { name: true, sku: true } },
          },
        },
      },
    });

    const totalRevenue = sales.reduce((acc, sale) => acc + sale.totalAmount, 0);

    return NextResponse.json({ sales, totalRevenue });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getUserSession();
    const { items } = await req.json();

    if (!items || !items.length) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Run within a Prisma transaction to guarantee atomic stock deduction
    const result = await prisma.$transaction(async (tx) => {
      let total = 0;
      const saleItemsToCreate = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }

        if (product.quantity < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.quantity}`);
        }

        // Deduct inventory stock
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: product.quantity - item.quantity },
        });

        const lineTotal = product.sellingPrice * item.quantity;
        total += lineTotal;

        saleItemsToCreate.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: product.sellingPrice,
        });
      }

      // Record the sale
      const createdSale = await tx.sale.create({
        data: {
          userId: session?.id || null,
          totalAmount: total,
          items: {
            create: saleItemsToCreate,
          },
        },
        include: { items: true },
      });

      return createdSale;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Checkout failed" },
      { status: 400 }
    );
  }
}
