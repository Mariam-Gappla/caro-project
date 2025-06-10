const rentalOfficeOrders=require("../models/rentalOfficeOrders");
const CarRental=require("../models/carRental");
const rentalOfficeOrder=require("../models/rentalOfficeOrders")
const addOrder= async(req,res,next)=>{
    try
    {
         const userId=req.user.id;
         const carId=req.params.id;
         const existCar=await CarRental.findById({_id:carId});
         if (!existCar) {
            return res.status(400).send({
                status: 400,
                message: "لم يتم العثور على السياره"
            });
        }
        const rentalOfficeId=existCar.rentalOfficeId;
        const order=await rentalOfficeOrders.create({userId,carId,rentalOfficeId});
        return res.status(200).send({
            status:200,
            message:"تم اضافه الاوردر",
            order:order
        })
         

    }
    catch(err)
    {
       next(err)
    }
}
const ordersForRentalOffice=async (req,res,next)=>{
   try
   {
        const rentalOfficeId=req.user.id;
        const orders= await rentalOfficeOrder.find({rentalOfficeId})
        if(!orders)
        {
            return res.status(200).send({
                status:200,
                message:"لا توجد طلبات لهذا المكتب"
            })
        }
          const rawComments = await rentalOfficeOrder.find({rentalOfficeId}).populate('carId');
          res.status(200).send({
            status:200,
            data:rawComments
          })
   }
   catch(err)
   {
    next(err)
   }
}
module.exports={
    addOrder,
    ordersForRentalOffice
}








