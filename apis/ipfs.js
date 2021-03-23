require('dotenv').config()
const fs = require('fs')
const formidable = require('formidable')
const router = require('express').Router()
const mongoose = require('mongoose')
const Collection = mongoose.model('Collection')

const pinataSDK = require('@pinata/sdk')
const pinata = pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_API_KEY,
)

// pin image file for NFT creation
const pinFileToIPFS = async (fileName, address, name, symbol) => {
  const options = {
    pinataMetadata: {
      name: name,
      keyvalues: {
        address: address,
        symbol: symbol,
      },
    },
    pinataOptions: {
      cidVersion: 0,
    },
  }
  const readableStreamForFile = fs.createReadStream('uploads/' + fileName)

  try {
    let result = await pinata.pinFileToIPFS(readableStreamForFile, options)
    return result
  } catch (error) {
    console.log(error)
    return 'failed to pin file to ipfs'
  }
}

// pin image for collection
const pinCollectionFileToIPFS = async (fileName, name, address) => {
  const options = {
    pinataMetadata: {
      name: name,
      keyvalues: {
        collectionName: name,
        address: address,
      },
    },
    pinataOptions: {
      cidVersion: 0,
    },
  }
  const readableStreamForFile = fs.createReadStream('uploads/' + fileName)

  try {
    let result = await pinata.pinFileToIPFS(readableStreamForFile, options)
    return result
  } catch (error) {
    console.log(error)
    return 'failed to pin file to ipfs'
  }
}
// pin json to ipfs for NFT
const pinJsonToIPFS = async (jsonMetadata) => {
  const options = {
    pinataMetadata: {
      name: jsonMetadata.name,
      keyvalues: {
        address: jsonMetadata.address,
      },
    },
    pinataOptions: {
      cidVersion: 0,
    },
  }

  try {
    let result = await pinata.pinJSONToIPFS(jsonMetadata, options)
    return result
  } catch (error) {
    console.log(error)
    return 'failed to pin json to ipfs'
  }
}
// pin json to ipfs for collection
const pinCollectionJsonToIPFS = async (jsonMetadata) => {
  const options = {
    pinataMetadata: {
      name: jsonMetadata.name,
      keyvalues: {
        collectionName: jsonMetadata.name,
      },
    },
    pinataOptions: {
      cidVersion: 0,
    },
  }

  try {
    let result = await pinata.pinJSONToIPFS(jsonMetadata, options)
    return result
  } catch (error) {
    console.log(error)
    return 'failed to pin json to ipfs'
  }
}

router.get('/ipfstest', async (req, res, next) => {
  pinata
    .testAuthentication()
    .then((result) => {
      console.log(result)
      res.send({
        result: result,
      })
    })
    .catch((err) => {
      console.log(err)
      res.send({
        result: 'failed',
      })
    })
})
router.get('/test', async (req, res, next) => {
  return res.json({
    apistatus: 'running',
  })
})

router.post('/uploadImage2Server', async (req, res, next) => {
  let form = new formidable.IncomingForm()
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        status: 'failed',
      })
    } else {
      let imgData = fields.image
      let name = fields.name
      let address = fields.address
      let royalty = fields.royalty
      let description = fields.description
      let category = fields.category
      let symbol = fields.symbol
      let imageFileName = address + now.toString() + '.png'
      imgData = imgData.replace(/^data:image\/png;base64,/, '')
      await fs.writeFile(
        '/home/jason/nft-marketplace/nifty-server/uploads/' + imageFileName,
        imgData,
        'base64',
        (err) => {
          if (err) {
            return res.status(400).json({
              status: 'failed to save an image file',
              err,
            })
          }
        },
      )
      let filePinStatus = await pinFileToIPFS(
        imageFileName,
        address,
        name,
        symbol,
      )

      // remove file once pinned
      fs.unlinkSync(
        '/home/jason/nft-marketplace/nifty-server/uploads/' + imageFileName,
      )
      let now = new Date()
      let currentTime = now.toTimeString()

      let metaData = {
        name: name,
        symbol: symbol,
        fileName: imageFileName,
        address: address,
        royalty: royalty,
        description: description,
        category: category,
        imageHash: filePinStatus.IpfsHash,
        createdAt: currentTime,
      }

      let jsonPinStatus = await pinJsonToIPFS(metaData)
      return res.send({
        status: 'success',
        uploadedCounts: 2,
        fileHash: filePinStatus.IpfsHash,
        jsonHash: jsonPinStatus.IpfsHash,
      })
    }
  })
})

router.post('/uploadCollectionImage2Server', async (req, res, next) => {
  let form = new formidable.IncomingForm()
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        status: 'failedParsingForm',
      })
    } else {
      let imgData = fields.image
      let name = fields.name
      let description = fields.description
      let address = fields.address
      let imageFileName = name + now.toString() + '.png'
      imgData = imgData.replace(/^data:image\/png;base64,/, '')
      await fs.writeFile(
        '/home/jason/nft-marketplace/nifty-server/uploads/' + imageFileName,
        imgData,
        'base64',
        (err) => {
          if (err) {
            return res.status(400).json({
              status: 'failed to save an image file',
              err,
            })
          }
        },
      )

      let filePinStatus = await pinCollectionFileToIPFS(
        imageFileName,
        name,
        address,
      )
      // remove file once pinned
      fs.unlinkSync(
        '/home/jason/nft-marketplace/nifty-server/uploads/' + imageFileName,
      )
      let collection = new Collection()
      collection.collectionName = name
      collection.description = description
      collection.imageHash = filePinStatus.IpfsHash

      try {
        collection.save((err, data) => {
          if (err) {
            return res.status(400).json({
              status: 'failedSavingToDB',
            })
          }
          return res.send({
            status: 'success',
            collection: collection.toJsonList(),
          })
        })
      } catch (error) {
        return res.status(400).json({
          status: 'failedOutSave',
        })
      }

      // we will not need to save the json file of the collection, rather it would be better off to store on the db
      // let now = new Date()
      // let currentTime = now.toTimeString()

      // let metaData = {
      //   name: name,
      //   fileName: imageFileName,
      //   address: address,
      //   description: description,
      //   imageHash: filePinStatus.IpfsHash,
      //   createdAt: currentTime,
      // }

      // let jsonPinStatus = await pinCollectionJsonToIPFS(metaData)

      // save collection info to db

      return res.send({
        status: 'success',
        // uploadedCounts: 2,
        fileHash: filePinStatus.IpfsHash,
        // jsonHash: jsonPinStatus.IpfsHash,
      })
    }
  })
})

module.exports = router
