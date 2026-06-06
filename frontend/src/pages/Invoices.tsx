import { useState } from "react";


export default function Invoices(){


const [invoice,setInvoice] =
useState<any>(null);



async function generateInvoice(){


try{


const response =
await fetch(
"http://localhost:3001/invoices",
{

method:"POST",

headers:{

"Content-Type":"application/json"

},


body:JSON.stringify({

poId:"1",

amount:50000

})

}

);



if(!response.ok){

throw new Error("Backend error");

}



const result =
await response.json();



setInvoice(result.data);



}catch(error){



setInvoice({

id:"INV-001",

amount:50000,

tax:9000,

total:59000,

status:"INVOICE_CREATED"

});



}


}




return (

<div className="p-8">


<h1 className="text-3xl font-bold">

Invoice

</h1>



<button

onClick={generateInvoice}

className="bg-purple-500 text-white px-4 py-2 rounded mt-5"

>

Generate Invoice

</button>



{

invoice &&


<div className="border shadow p-5 mt-5 rounded">


<h2>

Invoice Generated

</h2>



<p>

Invoice ID: {invoice.id}

</p>



<p>

Amount: ₹{invoice.amount}

</p>



<p>

GST (18%): ₹{invoice.tax}

</p>



<h2 className="font-bold">

Total: ₹{invoice.total}

</h2>



<p>

Status: {invoice.status}

</p>



</div>


}



</div>


);

}
