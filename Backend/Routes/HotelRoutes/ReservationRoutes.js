const express = require('express');
const router = express.Router();
const HotelControllers = require('../../Controller/Hotel/ReservationHandling');

router.post('/api/availabilitySearch', HotelControllers.AvailableRoomSearch);
router.get('/api/reserve', HotelControllers.NewReservation);

module.exports = router;