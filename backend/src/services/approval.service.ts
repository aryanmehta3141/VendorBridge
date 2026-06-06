import { prisma } from "../prisma/prisma";


export async function approveQuotationRecord(
  id: string,
  remarks?: string
) {

  const quotation =
    await prisma.quotation.update({

      where: {
        id
      },

      data: {

        status: "APPROVED"

      }

    });


  return {

    message: "Quotation approved successfully",

    data: quotation

  };

}




export async function rejectQuotationRecord(
  id: string,
  remarks?: string
) {


  const quotation =
    await prisma.quotation.update({

      where: {
        id
      },

      data: {

        status: "REJECTED"

      }

    });



  return {

    message: "Quotation rejected successfully",

    data: quotation

  };


}