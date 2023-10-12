import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { Metaplex, keypairIdentity, bundlrStorage, toMetaplexFile, toBigNumber } from "@metaplex-foundation/js";
import * as fs from 'fs';
import secret from './key.json' assert { type: "json" };
const QUICKNODE_RPC = 'https://api.devnet.solana.com';
const SOLANA_CONNECTION = new Connection(QUICKNODE_RPC);
const WALLET = Keypair.fromSecretKey(new Uint8Array(secret));
const METAPLEX = Metaplex.make(SOLANA_CONNECTION)
    .use(keypairIdentity(WALLET))
    .use(bundlrStorage({
        address: 'https://devnet.bundlr.network',
        providerUrl: QUICKNODE_RPC,
        timeout: 60000,
    }));
const CONFIG = {
    uploadPath: 'uploads/',
    imgFileName: 'mango_pops.png',
    imgType: 'image/png',
    imgName: 'MangoPops',
    description: 'test',
    attributes: [
        { trait_type: 'Flavour', value: 'Mango' },
        { trait_type: 'Taste', value: 'Sweet' },
    ],
    sellerFeeBasisPoints: 500,
    symbol: 'TST',
    creators: [
        { address: WALLET.publicKey, share: 100 }
    ]
};

async function uploadImage(filePath, fileName) {
    console.log(`Step 1 - Uploading Image`);
    const imgBuffer = fs.readFileSync(filePath + fileName);
    const imgMetaplexFile = toMetaplexFile(imgBuffer, fileName);
    const imgUri = await METAPLEX.storage().upload(imgMetaplexFile);
    console.log(`   Image URI:`, imgUri);
    return imgUri;
}

async function uploadMetadata(imgUri, imgType, nftName, description, attributes) {
    console.log(`Step 2 - Uploading Metadata`);
    const { uri } = await METAPLEX
        .nfts()
        .uploadMetadata({
            name: nftName,
            description: description,
            image: imgUri,
            attributes: attributes,
            properties: {
                files: [
                    {
                        type: imgType,
                        uri: imgUri,
                    },
                ]
            }
        });
    console.log('   Metadata URI:', uri);
    return uri;
}

async function mintNft(metadataUri, name, sellerFee, symbol, creators) {
    console.log(`Step 3 - Minting NFT`);
    const { nft } = await METAPLEX
    .nfts()
    .create({
        uri: metadataUri,
        name: name,
        sellerFeeBasisPoints: sellerFee,
        symbol: symbol,
        creators: creators,
        isMutable: false,
    },
    { commitment: "finalized" });
    console.log(`   Success!🎉`);
    console.log(`   Minted NFT: https://explorer.solana.com/address/${nft.address}?cluster=devnet`);
}

async function main() {
    //Step 1 - Upload Image
    // const imgUri = await uploadImage(CONFIG.uploadPath, CONFIG.imgFileName);
    //Step 2 - Upload Metadata
    // const metadataUri = await uploadMetadata("", CONFIG.imgType, CONFIG.imgName, CONFIG.description, CONFIG.attributes);
    //Step 3 - Mint NFT
    // await mintNft("", CONFIG.imgName, CONFIG.sellerFeeBasisPoints, CONFIG.symbol, CONFIG.creators);
    console.log(`Minting ${CONFIG.imgName} to an NFT in Wallet ${WALLET.publicKey.toBase58()}.`);
}

main();