const SimpleNFTSellerContract = {
  MAINNET_ADDRESS: '0xBe815322D12fE89E44dc2a4A6E613612C37e6840',
  TESTNET_ADDRESS: '0x4912B35AebD416d8bc96e7d6E5087841E740db7b',
  ABI: [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'owner',
          type: 'address'
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'nft',
          type: 'address'
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256'
        }
      ],
      name: 'ItemCanceled',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'owner',
          type: 'address'
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'nft',
          type: 'address'
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256'
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'quantity',
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
          name: 'pricePerItem',
          type: 'uint256'
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'startingTime',
          type: 'uint256'
        }
      ],
      name: 'ItemListed',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'seller',
          type: 'address'
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'buyer',
          type: 'address'
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'nft',
          type: 'address'
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256'
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'quantity',
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
          internalType: 'int256',
          name: 'unitPrice',
          type: 'int256'
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'pricePerItem',
          type: 'uint256'
        }
      ],
      name: 'ItemSold',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'owner',
          type: 'address'
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'nft',
          type: 'address'
        },
        {
          indexed: false,
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
          name: 'newPrice',
          type: 'uint256'
        }
      ],
      name: 'ItemUpdated',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'creator',
          type: 'address'
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'nft',
          type: 'address'
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256'
        }
      ],
      name: 'OfferCanceled',
      type: 'event'
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'creator',
          type: 'address'
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'nft',
          type: 'address'
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'tokenId',
          type: 'uint256'
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'quantity',
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
          name: 'pricePerItem',
          type: 'uint256'
        },
        {
          indexed: false,
          internalType: 'uint256',
          name: 'deadline',
          type: 'uint256'
        }
      ],
      name: 'OfferCreated',
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
          internalType: 'uint16',
          name: 'platformFee',
          type: 'uint16'
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
          name: '_creator',
          type: 'address'
        }
      ],
      name: 'acceptOffer',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
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
          name: '_nftAddress',
          type: 'address'
        },
        {
          internalType: 'uint256',
          name: '_tokenId',
          type: 'uint256'
        },
        {
          internalType: 'address payable',
          name: '_owner',
          type: 'address'
        }
      ],
      name: 'buyItem',
      outputs: [],
      stateMutability: 'payable',
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
          internalType: 'address',
          name: '_owner',
          type: 'address'
        }
      ],
      name: 'buyItem',
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
      name: 'cancelListing',
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
      name: 'cancelOffer',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address'
        }
      ],
      name: 'collectionRoyalties',
      outputs: [
        {
          internalType: 'uint16',
          name: 'royalty',
          type: 'uint16'
        },
        {
          internalType: 'address',
          name: 'creator',
          type: 'address'
        },
        {
          internalType: 'address',
          name: 'feeRecipient',
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
          internalType: 'contract IERC20',
          name: '_payToken',
          type: 'address'
        },
        {
          internalType: 'uint256',
          name: '_quantity',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: '_pricePerItem',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: '_deadline',
          type: 'uint256'
        }
      ],
      name: 'createOffer',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [],
      name: 'feeReceipient',
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
          name: '_payToken',
          type: 'address'
        }
      ],
      name: 'getPrice',
      outputs: [
        {
          internalType: 'int256',
          name: '',
          type: 'int256'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'address payable',
          name: '_feeRecipient',
          type: 'address'
        },
        {
          internalType: 'uint16',
          name: '_platformFee',
          type: 'uint16'
        }
      ],
      name: 'initialize',
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
          name: '_quantity',
          type: 'uint256'
        },
        {
          internalType: 'address',
          name: '_payToken',
          type: 'address'
        },
        {
          internalType: 'uint256',
          name: '_pricePerItem',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: '_startingTime',
          type: 'uint256'
        }
      ],
      name: 'listItem',
      outputs: [],
      stateMutability: 'nonpayable',
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
        },
        {
          internalType: 'address',
          name: '',
          type: 'address'
        }
      ],
      name: 'listings',
      outputs: [
        {
          internalType: 'uint256',
          name: 'quantity',
          type: 'uint256'
        },
        {
          internalType: 'address',
          name: 'payToken',
          type: 'address'
        },
        {
          internalType: 'uint256',
          name: 'pricePerItem',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: 'startingTime',
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
      name: 'minters',
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
          name: '',
          type: 'address'
        },
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256'
        },
        {
          internalType: 'address',
          name: '',
          type: 'address'
        }
      ],
      name: 'offers',
      outputs: [
        {
          internalType: 'contract IERC20',
          name: 'payToken',
          type: 'address'
        },
        {
          internalType: 'uint256',
          name: 'quantity',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: 'pricePerItem',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: 'deadline',
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
      inputs: [],
      name: 'platformFee',
      outputs: [
        {
          internalType: 'uint16',
          name: '',
          type: 'uint16'
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
          internalType: 'address',
          name: '_creator',
          type: 'address'
        },
        {
          internalType: 'uint16',
          name: '_royalty',
          type: 'uint16'
        },
        {
          internalType: 'address',
          name: '_feeRecipient',
          type: 'address'
        }
      ],
      name: 'registerCollectionRoyalty',
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
          internalType: 'uint16',
          name: '_royalty',
          type: 'uint16'
        }
      ],
      name: 'registerRoyalty',
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
          name: '',
          type: 'address'
        },
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256'
        }
      ],
      name: 'royalties',
      outputs: [
        {
          internalType: 'uint16',
          name: '',
          type: 'uint16'
        }
      ],
      stateMutability: 'view',
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
          internalType: 'address',
          name: '_payToken',
          type: 'address'
        },
        {
          internalType: 'uint256',
          name: '_newPrice',
          type: 'uint256'
        }
      ],
      name: 'updateListing',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'uint16',
          name: '_platformFee',
          type: 'uint16'
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
        },
        {
          internalType: 'address',
          name: '_seller',
          type: 'address'
        },
        {
          internalType: 'address',
          name: '_buyer',
          type: 'address'
        }
      ],
      name: 'validateItemSold',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    }
  ]
};

module.exports = SimpleNFTSellerContract;
