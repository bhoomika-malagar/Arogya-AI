const client =
  require("../config/twilio");



const sendOTP = async (

  phone,
  otp

) => {

  try {

    await client.messages.create({

      body:
        `Your Arogya AI OTP is ${otp}`,

      from:
        process.env.TWILIO_PHONE_NUMBER,

      to: phone

    });



    console.log(
      `OTP sent to ${phone}`
    );



    return true;

  } catch (error) {

    console.log(error);

    return false;

  }

};

module.exports = sendOTP;