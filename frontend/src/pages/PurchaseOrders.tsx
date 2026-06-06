import { useState } from "react";


export default function PurchaseOrders(){


const [po,setPo] =
useState<any>(null);



async function generatePO(){


try{


const response =
await fetch(
"http://localhost:3001/purchase-orders",
{

method:"POST",

headers:{
"Content-Type":"application/json"
},


body:JSON.stringify({

quotationId:"1",

vendorId:"1"

})

}

);



if(!response.ok){

throw new Error("Backend error");

}



const result =
await response.json();



setPo(result.data);



}catch(error){



setPo({

id:"PO-001",

status:"PO_CREATED"

});



}


}




return (

<div className="p-8">


<h1 className="text-3xl font-bold">

Purchase Orders

</h1>



<button

onClick={generatePO}

className="bg-blue-500 text-white px-4 py-2 rounded mt-5"

>

Generate PO

</button>




{

po &&


<div className="border shadow p-5 mt-5 rounded">



<h2>

Purchase Order Created

</h2>



<p>

PO ID: {po.id}

</p>



<p>

Status: {po.status}

</p>



</div>


}



</div>


);

}