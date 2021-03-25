const router = require('express').Router()
const mongoose = require('mongoose')
const ERC721TOKEN = mongoose.model('ERC721')

// list the newly minted 10 tokens
router.get('/getNewestTokens', async (req, res, next) => {})
