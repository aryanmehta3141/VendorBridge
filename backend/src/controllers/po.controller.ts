import { Request, Response } from "express";
import {prisma} from "../prisma/prisma";

export async function createPurchaseOrder(
  req: Request,
  res: Response
): Promise<void> {

  try {

    const { quotationId, vendorId } = req.body;


    const purchaseOrder =
      await prisma.purchaseOrder.create({

        data: {

          quotationId,

          vendorId,

          status: "PO_CREATED"

        }

      });



    res.status(201).json({

      message: "Purchase Order created successfully",

      data: purchaseOrder

    });


  } catch (error) {

    res.status(500).json({

      message: "Failed to create purchase order"

    });

  }

}



// Get all Purchase Orders
export async function getPurchaseOrders(
  _req: Request,
  res: Response
): Promise<void> {


  try {


    const purchaseOrders =
      await prisma.purchaseOrder.findMany();



    res.json({

      data: purchaseOrders

    });



  } catch (error) {


    res.status(500).json({

      message: "Failed to fetch purchase orders"

    });


  }

}