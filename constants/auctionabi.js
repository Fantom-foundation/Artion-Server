const AuctionContractABI = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'nftAddress',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256'
      }
    ],
    name: 'AuctionCancelled',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'nftAddress',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'payToken',
        type: 'address'
      }
    ],
    name: 'AuctionCreated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'nftAddress',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'winner',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'payToken',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'int256',
        name: 'unitPrice',
        type: 'int256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'winningBid',
        type: 'uint256'
      }
    ],
    name: 'AuctionResulted',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'nftAddress',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'bidder',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'bid',
        type: 'uint256'
      }
    ],
    name: 'BidPlaced',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'nftAddress',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'bidder',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'bid',
        type: 'uint256'
      }
    ],
    name: 'BidRefunded',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'nftAddress',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'bidder',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'bid',
        type: 'uint256'
      }
    ],
    name: 'BidWithdrawn',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [],
    name: 'FantomAuctionContractDeployed',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'previousOwner',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newOwner',
        type: 'address'
      }
    ],
    name: 'OwnershipTransferred',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'bool',
        name: 'isPaused',
        type: 'bool'
      }
    ],
    name: 'PauseToggled',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'nftAddress',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'endTime',
        type: 'uint256'
      }
    ],
    name: 'UpdateAuctionEndTime',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'nftAddress',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'payToken',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'reservePrice',
        type: 'uint256'
      }
    ],
    name: 'UpdateAuctionReservePrice',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'nftAddress',
        type: 'address'
      },
      {
        indexed: true,
        internalType: 'uint256',
        name: 'tokenId',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'startTime',
        type: 'uint256'
      }
    ],
    name: 'UpdateAuctionStartTime',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'bidWithdrawalLockTime',
        type: 'uint256'
      }
    ],
    name: 'UpdateBidWithdrawalLockTime',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'minBidIncrement',
        type: 'uint256'
      }
    ],
    name: 'UpdateMinBidIncrement',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'platformFee',
        type: 'uint256'
      }
    ],
    name: 'UpdatePlatformFee',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address payable',
        name: 'platformFeeRecipient',
        type: 'address'
      }
    ],
    name: 'UpdatePlatformFeeRecipient',
    type: 'event'
  },
  {
    inputs: [],
    name: 'addressRegistry',
    outputs: [
      {
        internalType: 'contract IFantomAddressRegistry',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    name: 'auctions',
    outputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address'
      },
      {
        internalType: 'address',
        name: 'payToken',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'reservePrice',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'startTime',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'endTime',
        type: 'uint256'
      },
      {
        internalType: 'bool',
        name: 'resulted',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'bidWithdrawalLockTime',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_nftAddress',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256'
      }
    ],
    name: 'cancelAuction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_nftAddress',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: '_payToken',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: '_reservePrice',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_startTimestamp',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_endTimestamp',
        type: 'uint256'
      }
    ],
    name: 'createAuction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_nftAddress',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256'
      }
    ],
    name: 'getAuction',
    outputs: [
      {
        internalType: 'address',
        name: '_owner',
        type: 'address'
      },
      {
        internalType: 'address',
        name: '_payToken',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: '_reservePrice',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_startTime',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_endTime',
        type: 'uint256'
      },
      {
        internalType: 'bool',
        name: '_resulted',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_nftAddress',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256'
      }
    ],
    name: 'getHighestBidder',
    outputs: [
      {
        internalType: 'address payable',
        name: '_bidder',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: '_bid',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_lastBidTime',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    name: 'highestBids',
    outputs: [
      {
        internalType: 'address payable',
        name: 'bidder',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'bid',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'lastBidTime',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address payable',
        name: '_platformFeeRecipient',
        type: 'address'
      }
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'isPaused',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'minBidIncrement',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'owner',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_nftAddress',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_bidAmount',
        type: 'uint256'
      }
    ],
    name: 'placeBid',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_nftAddress',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256'
      }
    ],
    name: 'placeBid',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'platformFee',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'platformFeeRecipient',
    outputs: [
      {
        internalType: 'address payable',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_tokenContract',
        type: 'address'
      }
    ],
    name: 'reclaimERC20',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_nftAddress',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256'
      }
    ],
    name: 'resultAuction',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'toggleIsPaused',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'newOwner',
        type: 'address'
      }
    ],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_registry',
        type: 'address'
      }
    ],
    name: 'updateAddressRegistry',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_nftAddress',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_endTimestamp',
        type: 'uint256'
      }
    ],
    name: 'updateAuctionEndTime',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_nftAddress',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_reservePrice',
        type: 'uint256'
      }
    ],
    name: 'updateAuctionReservePrice',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_nftAddress',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: '_startTime',
        type: 'uint256'
      }
    ],
    name: 'updateAuctionStartTime',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_bidWithdrawalLockTime',
        type: 'uint256'
      }
    ],
    name: 'updateBidWithdrawalLockTime',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_minBidIncrement',
        type: 'uint256'
      }
    ],
    name: 'updateMinBidIncrement',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_platformFee',
        type: 'uint256'
      }
    ],
    name: 'updatePlatformFee',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address payable',
        name: '_platformFeeRecipient',
        type: 'address'
      }
    ],
    name: 'updatePlatformFeeRecipient',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_nftAddress',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: '_tokenId',
        type: 'uint256'
      }
    ],
    name: 'withdrawBid',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
];

module.exports = AuctionContractABI;
