import algosdk from "algosdk";
import MyAlgoConnect from "@randlabs/myalgo-connect";

const config = {
    algodToken: "",
    algodServer: "https://node.testnet.algoexplorerapi.io",
    algodPort: "",
    indexerToken: "",
    indexerServer: "https://algoindexer.testnet.algoexplorerapi.io",
    indexerPort: "",
}

export const algodClient = new algosdk.Algodv2(config.algodToken, config.algodServer, config.algodPort)

export const indexerClient = new algosdk.Indexer(config.indexerToken, config.indexerServer, config.indexerPort);

export const myAlgoConnect = new MyAlgoConnect();

export const minRound = 21540981;

export const ALGORAND_DECIMALS = 6;


// https://github.com/algorandfoundation/ARCs/blob/main/ARCs/arc-0002.md
export const mentorNote = "mentorship:k9"

// Maximum local storage allocation, immutable
export const numLocalInts = 2;// Has liked, Has Bought
export const numLocalBytes = 0;
// Maximum global storage allocation, immutable
export const numGlobalInts = 6; // 
export const numGlobalBytes = 2; // 

export const base64ToUTF8String = (base64String) => {
    return Buffer.from(base64String, 'base64').toString("utf-8")
}

export const utf8ToBase64String = (utf8String) => {
    return Buffer.from(utf8String, 'utf8').toString('base64')
}