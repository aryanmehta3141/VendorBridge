import { useState } from "react";

export default function Approval() {

  const [status, setStatus] =
    useState("PENDING_APPROVAL");


  async function approve() {

  try {

    const response = await fetch(
      "http://localhost:3001/approvals/1/approve",
      {
        method:"POST"
      }
    );


    if(!response.ok){
      throw new Error("Backend error");
    }


  } catch(error){

    console.log("Demo approval");

  }


  setStatus("APPROVED");

}




async function reject() {

  try {

    const response = await fetch(
      "http://localhost:3001/approvals/1/reject",
      {
        method:"POST"
      }
    );


    if(!response.ok){
      throw new Error("Backend error");
    }


  } catch(error){

    console.log("Demo reject");

  }


  setStatus("REJECTED");

}


  return (

    <div className="p-8">


      <h1 className="text-3xl font-bold">

        Manager Approval

      </h1>


      <div className="border rounded p-5 mt-5 shadow">


        <h2 className="text-xl">

          Vendor: ABC Technologies

        </h2>


        <p>
          Amount: ₹50000
        </p>


        <p>
          Status: {status}
        </p>



        <button
        onClick={approve}
        className="bg-green-500 text-white px-4 py-2 m-2 rounded"
        >

        Approve

        </button>



        <button
        onClick={reject}
        className="bg-red-500 text-white px-4 py-2 rounded"
        >

        Reject

        </button>


      </div>


    </div>

  );

}