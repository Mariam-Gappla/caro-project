const { invalid } = require("joi");
const contactus = require("../../models/contactUs");
const rentalOffice = require("../../models/rentalOffice");
const { invoice } = require("./ar");

module.exports = {
  register: {
    emailExists: {
      rentalOffice: "This rental office already exists",
      serviceProvider: "This service provider already exists",
      user: "This user already exists"
    },
    createdSuccessfully: "Account created successfully",
  },
  login: {
    emailExists: {
      rentalOffice: "This rental office does not exist, please create an account",
      serviceProvider: "This service provider does not exist, please create an account",
      user: "This user does not exist, please create an account"
    },
    incorrectData: "The entered information is incorrect, please check your email and password",
    success: "Logged in successfully",
  },
  rentalOffice:{
    haveCars:"this rental office does not have cars",
    existRentalOffice:"this rental office does not exist",
    addLike: "The rental office has been liked",
    removeLike: "The like has been removed from the rental office",
    rentalOfficeId: "Rental office ID is required",
    ratingNotFound: "This rental office does not have a rating",
    ratingUser:"no rating"
  },
  rentalCar:{
    existCar:"this car does not exist",
    rentalType:"rental type not correct should be weekly/daily or rent to own",
    video:"video for car required",
    onlyVideo:"Only one video file is allowed to be uploaded",
    invalidFormat:"Only video files are allowed"
  },
  follower:{
    success:"Followed this rental office successfully.",
    exist:"You are already following this rental office.",
    noFollowers: "This rental office has no followers"
  },
  required:{
    userIdAndRentalId:"UserId and RentalId are required"
  },
  order:{
    addOrder:"order added sucessfully",
    existOrders:"this rental office dose not have orders",
    alreadyBooked: "You have already booked this car",
    notExist: "This order does not exist",
    orderId:"orderId is required",
    acceptedSuccess:"order accepted and video uploaded",
    licenseImage:"Only image files are allowed.",
    licenseImageRequired:"licenseImage is required"
  },
  replyOnComment: {
  addReplay: "Reply added successfully",
  getreplies:"Replies fetched successfully"
},
invalid:{
   commentIdAndTweetId:"Invalid comment or tweet ID"
  },
  tweet: {
  addTweet: "Tweet added successfully",
  existTweet: "Tweet not found",
  addLike: "Tweet liked",
  removeLike: "Tweet unliked"
},
sendCode: {
  success: "The code has been sent to this number and will be valid for 5 minutes"
},
verify: {
  success: "Verification successful",
  error: "The code is incorrect",
  notExist:"This code is invalid. Please enter your phone number to receive a new code via SMS"
},
contactus:{
  success: "Message sent successfully",
  error: "An error occurred while sending the message, please try again later",
},
invoice:{
  success: "Invoice created successfully",
  userId:"This user does not exist",
  rentalOfficeId: "This rental office does not exist",
  orderId: "This order does not exist",
  existInvoice: "This invoice already exists for this user and rental office",
  invalidOrderForUserOrOffice: "This order is not associated with the specified user or rental office"
},
rating:{
  success: "Rating added successfully",
  invalidOrder: "You can rate the order after receiving it",
  alreadyRated: "You have already rated this order",

}

};
