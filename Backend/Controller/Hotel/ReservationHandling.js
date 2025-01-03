const nodemailer = require('nodemailer');
const RoomInfo = require('../../Models/HotelSchema/RoomsSchema');
const ReservationSchedule = require('../../Models/HotelSchema/RoomSchedules');
const jwt = require('jsonwebtoken');

const url = process.env.NODE_ENV === 'production' ? 'https://silverstone-hotel.onrender.com' : 'http://localhost:5173/';

const AvailableRoomSearch = async (req, res) => {
    const { checkInDate, checkOutDate } = req.body;
    try {
        // Convert check-in and check-out dates to Date objects
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const gap = Math.floor((checkOut - checkIn) / (1000 * 60 * 60 * 24));

        const RoomSchedules = await ReservationSchedule.find();
        const roomAvailable = RoomSchedules.filter(sched => {
            return (checkIn >= sched.checkOutDate || checkOut <= sched.checkInDate);
        });

        const rooms = await RoomInfo.find();

        for (let i = 0; i < roomAvailable.length; i++) {
            // Loop through rooms and update roomLimit
            for (let j = 0; j < rooms.length; j++) {
                if (roomAvailable[i].roomType === rooms[j].roomType) {
                    rooms[j].roomLimit += roomAvailable[i].totalRooms;
                }
            }
        }

        return res.status(200).json({ roomAvailable:rooms , gap });

    } catch (err) {
        // Send an error response with the error message
        console.log(err);
        return res.status(500).json({ message: err.message });
    }
};



const NewReservation = async (req,res) => {
    const checkoutData = jwt.verify(req.cookies.checkoutData, process.env.JWT_SECRET);
    const {checkInDate,checkOutDate,
        selectedRooms,fullName,
        email,phoneNumber,
        daysGap, roomCount,
        guestNumber}  = checkoutData;

    console.log('1');
    const checkIn = new Date(checkInDate);  
    const checkOut = new Date(checkOutDate);

    try{

        for (const [index, reservation] of selectedRooms.entries()) {
            const updatedPrice = ((reservation.price * daysGap) * roomCount[index]) + ((guestNumber[index] - reservation.maximumGuest) * 1200);

            // Create the reservation and update room information
            const newReservation = new ReservationSchedule({
                roomType: reservation.roomType,
                checkInDate:checkIn,
                checkOutDate:checkOut,
                guestName: fullName,
                guestContact: phoneNumber,
                guestEmail: email,
                totalRooms: roomCount[index],
                totalGuests: guestNumber[index],
                totalPrice: updatedPrice,
            });
            await newReservation.save();
            await RoomInfo.findOneAndUpdate(
                { roomType: reservation.roomType },
                { $set: { roomLimit: reservation.roomLimit - roomCount[index] } }
            );
            
        }

        res.clearCookie('checkoutData', { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production'  
        });

        res.redirect(url);

    }catch(err){
        console.log('reservation err: ', err);
        res.status(500).json({ message: err.message });
    }
}


const get_verification_code = async (req,res) => {
    const {email} = req.params;

    try{
        const code = Math.floor(Math.random() * 9000) + 1000;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
        });
        
    
        const info = await transporter.sendMail({
            from: "SilverStone Hotel Reservations", // sender address
            to: email, // list of receivers
            subject: "Email Verification", // Subject line
            text: `Here's your verification code: ${code}`, 
        });
        
        console.log('backend code', code);
        return res.status(200).json({code});

    }catch(err){
        console.log('Error at sending verification', err);
    }
   
}


const DeleteReservation = async (req,res) => {
    
    try{
        
       
        
    }catch(err){
        res.status(500).json('error' , { message: err.message });
    }
}

const UpdateReservation = async (req,res) => {
    
    try{

       
        
    }catch(err){
        res.status(500).json('error' , { message: err.message });
    }
}

module.exports = {
    AvailableRoomSearch,
    NewReservation,
    DeleteReservation,
    UpdateReservation,
    get_verification_code,
}