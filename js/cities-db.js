const deliveryCities = [
  {
    "id": "lahore",
    "name": "Lahore",
    "province": "Punjab",
    "deliveryTime": "24-48 Hours"
  },
  {
    "id": "faisalabad",
    "name": "Faisalabad",
    "province": "Punjab",
    "deliveryTime": "24-48 Hours"
  },
  {
    "id": "rawalpindi",
    "name": "Rawalpindi",
    "province": "Punjab",
    "deliveryTime": "24-48 Hours"
  },
  {
    "id": "gujranwala",
    "name": "Gujranwala",
    "province": "Punjab",
    "deliveryTime": "24-48 Hours"
  },
  {
    "id": "multan",
    "name": "Multan",
    "province": "Punjab",
    "deliveryTime": "Same Day (Local Pickup Available)"
  },
  {
    "id": "bahawalpur",
    "name": "Bahawalpur",
    "province": "Punjab",
    "deliveryTime": "24-48 Hours"
  },
  {
    "id": "sargodha",
    "name": "Sargodha",
    "province": "Punjab",
    "deliveryTime": "24-48 Hours"
  },
  {
    "id": "sialkot",
    "name": "Sialkot",
    "province": "Punjab",
    "deliveryTime": "24-48 Hours"
  },
  {
    "id": "sheikhupura",
    "name": "Sheikhupura",
    "province": "Punjab",
    "deliveryTime": "24-48 Hours"
  },
  {
    "id": "rahim-yar-khan",
    "name": "Rahim Yar Khan",
    "province": "Punjab",
    "deliveryTime": "48 Hours"
  },
  {
    "id": "jhang",
    "name": "Jhang",
    "province": "Punjab",
    "deliveryTime": "48 Hours"
  },
  {
    "id": "dera-ghazi-khan",
    "name": "Dera Ghazi Khan",
    "province": "Punjab",
    "deliveryTime": "48 Hours"
  },
  {
    "id": "gujrat",
    "name": "Gujrat",
    "province": "Punjab",
    "deliveryTime": "24-48 Hours"
  },
  {
    "id": "sahiwal",
    "name": "Sahiwal",
    "province": "Punjab",
    "deliveryTime": "24-48 Hours"
  },
  {
    "id": "okara",
    "name": "Okara",
    "province": "Punjab",
    "deliveryTime": "24-48 Hours"
  },
  {
    "id": "kasur",
    "name": "Kasur",
    "province": "Punjab",
    "deliveryTime": "24-48 Hours"
  },
  {
    "id": "chiniot",
    "name": "Chiniot",
    "province": "Punjab",
    "deliveryTime": "48 Hours"
  },
  {
    "id": "kamoke",
    "name": "Kamoke",
    "province": "Punjab",
    "deliveryTime": "48 Hours"
  },
  {
    "id": "hafizabad",
    "name": "Hafizabad",
    "province": "Punjab",
    "deliveryTime": "48 Hours"
  },
  {
    "id": "sadeqabad",
    "name": "Sadeqabad",
    "province": "Punjab",
    "deliveryTime": "48 Hours"
  },
  {
    "id": "burewala",
    "name": "Burewala",
    "province": "Punjab",
    "deliveryTime": "48 Hours"
  },
  {
    "id": "mandi-bahauddin",
    "name": "Mandi Bahauddin",
    "province": "Punjab",
    "deliveryTime": "48 Hours"
  },
  {
    "id": "vehari",
    "name": "Vehari",
    "province": "Punjab",
    "deliveryTime": "48 Hours"
  },
  {
    "id": "daska",
    "name": "Daska",
    "province": "Punjab",
    "deliveryTime": "48 Hours"
  },
  {
    "id": "pakpattan",
    "name": "Pakpattan",
    "province": "Punjab",
    "deliveryTime": "48 Hours"
  },
  {
    "id": "karachi",
    "name": "Karachi",
    "province": "Sindh",
    "deliveryTime": "3-4 Days"
  },
  {
    "id": "hyderabad",
    "name": "Hyderabad",
    "province": "Sindh",
    "deliveryTime": "3-4 Days"
  },
  {
    "id": "sukkur",
    "name": "Sukkur",
    "province": "Sindh",
    "deliveryTime": "3-4 Days"
  },
  {
    "id": "larkana",
    "name": "Larkana",
    "province": "Sindh",
    "deliveryTime": "3-4 Days"
  },
  {
    "id": "nawabshah",
    "name": "Nawabshah",
    "province": "Sindh",
    "deliveryTime": "3-4 Days"
  },
  {
    "id": "mirpur-khas",
    "name": "Mirpur Khas",
    "province": "Sindh",
    "deliveryTime": "3-4 Days"
  },
  {
    "id": "jacobabad",
    "name": "Jacobabad",
    "province": "Sindh",
    "deliveryTime": "4-5 Days"
  },
  {
    "id": "shikarpur",
    "name": "Shikarpur",
    "province": "Sindh",
    "deliveryTime": "4-5 Days"
  },
  {
    "id": "khairpur",
    "name": "Khairpur",
    "province": "Sindh",
    "deliveryTime": "4-5 Days"
  },
  {
    "id": "dadu",
    "name": "Dadu",
    "province": "Sindh",
    "deliveryTime": "4-5 Days"
  },
  {
    "id": "tando-adam",
    "name": "Tando Adam",
    "province": "Sindh",
    "deliveryTime": "4-5 Days"
  },
  {
    "id": "tando-allahyar",
    "name": "Tando Allahyar",
    "province": "Sindh",
    "deliveryTime": "4-5 Days"
  },
  {
    "id": "peshawar",
    "name": "Peshawar",
    "province": "Khyber Pakhtunkhwa",
    "deliveryTime": "2-3 Days"
  },
  {
    "id": "mardan",
    "name": "Mardan",
    "province": "Khyber Pakhtunkhwa",
    "deliveryTime": "2-3 Days"
  },
  {
    "id": "mingora",
    "name": "Mingora (Swat)",
    "province": "Khyber Pakhtunkhwa",
    "deliveryTime": "3-4 Days"
  },
  {
    "id": "kohat",
    "name": "Kohat",
    "province": "Khyber Pakhtunkhwa",
    "deliveryTime": "3-4 Days"
  },
  {
    "id": "abbottabad",
    "name": "Abbottabad",
    "province": "Khyber Pakhtunkhwa",
    "deliveryTime": "3-4 Days"
  },
  {
    "id": "dera-ismail-khan",
    "name": "Dera Ismail Khan",
    "province": "Khyber Pakhtunkhwa",
    "deliveryTime": "3-4 Days"
  },
  {
    "id": "nowshera",
    "name": "Nowshera",
    "province": "Khyber Pakhtunkhwa",
    "deliveryTime": "3-4 Days"
  },
  {
    "id": "swabi",
    "name": "Swabi",
    "province": "Khyber Pakhtunkhwa",
    "deliveryTime": "3-4 Days"
  },
  {
    "id": "quetta",
    "name": "Quetta",
    "province": "Balochistan",
    "deliveryTime": "4-5 Days"
  },
  {
    "id": "turbat",
    "name": "Turbat",
    "province": "Balochistan",
    "deliveryTime": "5-6 Days"
  },
  {
    "id": "khuzdar",
    "name": "Khuzdar",
    "province": "Balochistan",
    "deliveryTime": "5-6 Days"
  },
  {
    "id": "chaman",
    "name": "Chaman",
    "province": "Balochistan",
    "deliveryTime": "5-6 Days"
  },
  {
    "id": "islamabad",
    "name": "Islamabad",
    "province": "Capital Territory",
    "deliveryTime": "24-48 Hours"
  }
];