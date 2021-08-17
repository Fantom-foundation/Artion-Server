const fMintABI = [
  "function getPrice(address _token) public view returns (uint256)",
  "function getExtendedPrice(address _token) public view returns (uint256 _price, uint256 _digits)",
];

module.exports = fMintABI;
