async function geocodeAddress(address) {
  return {
    latitude: 0,
    longitude: 0,
    placeName: address,
  };
}

module.exports = geocodeAddress;
