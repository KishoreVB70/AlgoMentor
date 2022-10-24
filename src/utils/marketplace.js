import algosdk from "algosdk";

import {
    algodClient,
    indexerClient,
    mentorNote,
    minRound,
    myAlgoConnect,
    numGlobalBytes,
    numGlobalInts,
    numLocalBytes,
    numLocalInts,
    base64ToUTF8String, 
    utf8ToBase64String
} from "./constants";

/* eslint import/no-webpack-loader-syntax: off */
import approvalProgram from "!!raw-loader!../contracts/mentorapproval.teal";
import clearProgram from "!!raw-loader!../contracts/mentorclear.teal";
import { stringToMicroAlgos } from "./conversions";


class Mentor {
    
    constructor(expertise, description, price, avgrating, numofraters, totalrating, buyers,  amountdonated, hasbought, hasrated, appId, owner) {
        this.expertise = expertise;
        this.description = description;
        this.price = price;
        this.avgrating = avgrating;
        this.numofraters = numofraters;
        this.totalrating = totalrating;
        this.buyers = buyers;
        this.amountdonated = amountdonated;
        this.hasbought = hasbought;
        this.hasrated = hasrated;
        this.appId = appId;
        this.owner = owner;
    }
}

// Compile smart contract in .teal format to program
const compileProgram = async (programSource) => {
    let encoder = new TextEncoder();
    let programBytes = encoder.encode(programSource);
    let compileResponse = await algodClient.compile(programBytes).do();
    return new Uint8Array(Buffer.from(compileResponse.result, "base64"));
}

// CREATE MENTOR: ApplicationCreateTxn
export const createMentorAction = async (senderAddress, mentor) => {
    console.log("Adding mentor...")

    let params = await algodClient.getTransactionParams().do();
    params.fee = algosdk.ALGORAND_MIN_TX_FEE;
    params.flatFee = true;
    
    // Compile programs
    const compiledApprovalProgram = await compileProgram(approvalProgram)
    const compiledClearProgram = await compileProgram(clearProgram)

    // Build note to identify transaction later and required app args as Uint8Arrays
    let note = new TextEncoder().encode(mentorNote);
    let expertise = new TextEncoder().encode(mentor.expertise);
    let description = new TextEncoder().encode(mentor.description);
    let price = algosdk.encodeUint64(mentor.price);


    let appArgs = [expertise, description,price]

    // Create ApplicationCreateTxn
    let txn = algosdk.makeApplicationCreateTxnFromObject({
        from: senderAddress,
        suggestedParams: params,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        approvalProgram: compiledApprovalProgram,
        clearProgram: compiledClearProgram,
        numLocalInts: numLocalInts,
        numLocalByteSlices: numLocalBytes,
        numGlobalInts: numGlobalInts,
        numGlobalByteSlices: numGlobalBytes,
        note: note,
        appArgs: appArgs
    });

    // Get transaction ID
    let txId = txn.txID().toString();

    // Sign & submit the transaction
    let signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
    console.log("Signed transaction with txID: %s", txId);
    await algodClient.sendRawTransaction(signedTxn.blob).do();

    // Wait for transaction to be confirmed
    let confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

    // Get the completed Transaction
    console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

    // Get created application id and notify about completion
    let transactionResponse = await algodClient.pendingTransactionInformation(txId).do();
    let appId = transactionResponse['application-index'];
    console.log("Created new app-id: ", appId);
    return appId;
}

export const optIn = async (senderAddress, appId) => {
    let accountInfo = await indexerClient.lookupAccountByID(senderAddress).do();
    console.log(accountInfo);
    let optInApps  = accountInfo.account["apps-local-state"];
    if(optInApps.find(app => app.id === appId) !== undefined){
        return;
    }

    let params = await algodClient.getTransactionParams().do();
    // create unsigned transaction
    let txn = algosdk.makeApplicationOptInTxn(senderAddress, params, appId);

    // Get transaction ID
    let txId = txn.txID().toString();

    // Sign & submit the transaction
    let signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
    console.log("Signed transaction with txID: %s", txId);
    await algodClient.sendRawTransaction(signedTxn.blob).do();

    // Wait for transaction to be confirmed
    let confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

    // Get the completed Transaction
    console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
}


// BUY PRODUCT: Group transaction consisting of ApplicationCallTxn and PaymentTxn
export const buyMentorAction = async (senderAddress, mentor, hours) => {
    console.log("Buying mentor...");
    
    let params = await algodClient.getTransactionParams().do();
    params.fee = algosdk.ALGORAND_MIN_TX_FEE;
    params.flatFee = true;
    
    // Build required app args as Uint8Array
    let buyArg = new TextEncoder().encode("buy")
    let hoursArg = algosdk.encodeUint64(parseInt(hours));
    let appArgs = [buyArg, hoursArg]
    // Create ApplicationCallTxn
    let appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        from: senderAddress,
        appIndex: mentor.appId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        suggestedParams: params,
        appArgs: appArgs
    })

    // Create PaymentTxn
    let paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: senderAddress,
        to: mentor.owner,
        amount: mentor.price * hours,
        suggestedParams: params
    })

    let txnArray = [appCallTxn, paymentTxn]

    // Create group transaction out of previously build transactions
    let groupID = algosdk.computeGroupID(txnArray)
    for (let i = 0; i < 2; i++) txnArray[i].group = groupID;

    // Sign & submit the group transaction
    let signedTxn = await myAlgoConnect.signTransaction(txnArray.map(txn => txn.toByte()));
    console.log("Signed group transaction");
    let tx = await algodClient.sendRawTransaction(signedTxn.map(txn => txn.blob)).do();

    // Wait for group transaction to be confirmed
    let confirmedTxn = await algosdk.waitForConfirmation(algodClient, tx.txId, 4);

    // Notify about completion
    console.log("Group transaction " + tx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
}

// RATE Mentor: Group transaction consisting of ApplicationCallTxn and PaymentTxn
export const rateMentorAction = async (senderAddress, mentor, rate) => {
    console.log("Rate property...");
  
    let params = await algodClient.getTransactionParams().do();
  
    // Build required app args as Uint8Array
    let rateArg = new TextEncoder().encode("rate");
    console.log(rate);
    let ratingArg = algosdk.encodeUint64(parseInt(rate));
    console.log(ratingArg);
  
    let appArgs = [rateArg, ratingArg];
  
    // Create ApplicationCallTxn
    let appCallTxn = algosdk.makeApplicationCallTxnFromObject({
      from: senderAddress,
      appIndex: mentor.appId,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      suggestedParams: params,
      appArgs: appArgs,
    });
  
    let txnArray = [appCallTxn];
  
    // Create group transaction out of previously build transactions
    let groupID = algosdk.computeGroupID(txnArray);
    for (let i = 0; i < 1; i++) txnArray[i].group = groupID;
  
    // Sign & submit the group transaction
    let signedTxn = await myAlgoConnect.signTransaction(
      txnArray.map((txn) => txn.toByte())
    );
    console.log("Signed group transaction");
    let tx = await algodClient
      .sendRawTransaction(signedTxn.map((txn) => txn.blob))
      .do();
  
    // Wait for group transaction to be confirmed
    let confirmedTxn = await algosdk.waitForConfirmation(algodClient, tx.txId, 4);
  
    // Notify about completion
    console.log(
      "Group transaction " +
        tx.txId +
        " confirmed in round " +
        confirmedTxn["confirmed-round"]
    );
  };

  export const changePriceAction = async (senderAddress, mentor, amount) => {
    console.log("Change price...");
  
    let params = await algodClient.getTransactionParams().do();
  
    // Build required app args as Uint8Array
    let changeArg = new TextEncoder().encode("changeprice");
    let crctAmount = stringToMicroAlgos(amount);
    console.log(crctAmount)
    let amountArg = algosdk.encodeUint64(crctAmount);
    console.log(amountArg)
    let appArgs = [changeArg, amountArg];
  
    // Create ApplicationCallTxn
    let txn = algosdk.makeApplicationCallTxnFromObject({
      from: senderAddress,
      appIndex: mentor.appId,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      suggestedParams: params,
      appArgs,
    });
  
    // Get transaction ID
    let txId = txn.txID().toString();
  
    // Sign & submit the transaction
    let signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
    console.log("Signed transaction with txID: %s", txId);
    await algodClient.sendRawTransaction(signedTxn.blob).do();
  
    // Wait for transaction to be confirmed
    let confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);
  
    // Get the completed Transaction
    console.log(
      "Transaction " +
        txId +
        " confirmed in round " +
        confirmedTxn["confirmed-round"]
    );
  };
  
export const supportMentorAction = async (senderAddress, mentor, amount) => {

    let params = await algodClient.getTransactionParams().do();
    params.fee = algosdk.ALGORAND_MIN_TX_FEE;
    params.flatFee = true;

    let actualAmount = parseInt(amount)
    // Build required app args as Uint8Array
    let supportArg = new TextEncoder().encode("support")
    console.log(amount)
    let amountArg = algosdk.encodeUint64(actualAmount);
    let appArgs = [supportArg, amountArg]

    // Create ApplicationCallTxn
    let appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        from: senderAddress,
        appIndex: mentor.appId,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        suggestedParams: params,
        appArgs: appArgs
    })

    // Create PaymentTxn
    let paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: senderAddress,
        to: mentor.owner,
        amount: actualAmount,
        suggestedParams: params
    })

    let txnArray = [appCallTxn, paymentTxn]

    // Create group transaction out of previously build transactions
    let groupID = algosdk.computeGroupID(txnArray)
    for (let i = 0; i < 2; i++) txnArray[i].group = groupID;

    // Sign & submit the group transaction
    let signedTxn = await myAlgoConnect.signTransaction(txnArray.map(txn => txn.toByte()));
    console.log("Signed group transaction");
    let tx = await algodClient.sendRawTransaction(signedTxn.map(txn => txn.blob)).do();

    // Wait for group transaction to be confirmed
    let confirmedTxn = await algosdk.waitForConfirmation(algodClient, tx.txId, 4);

    // Notify about completion
    console.log("Group transaction " + tx.txId + " confirmed in round " + confirmedTxn["confirmed-round"]);
}


export const deleteMentorAction = async (senderAddress, index) => {
    console.log("Deleting application...");

    let params = await algodClient.getTransactionParams().do();
    params.fee = algosdk.ALGORAND_MIN_TX_FEE;
    params.flatFee = true;

    // Create ApplicationDeleteTxn
    let txn = algosdk.makeApplicationDeleteTxnFromObject({
        from: senderAddress, suggestedParams: params, appIndex: index,
    });

    // Get transaction ID
    let txId = txn.txID().toString();

    // Sign & submit the transaction
    let signedTxn = await myAlgoConnect.signTransaction(txn.toByte());
    console.log("Signed transaction with txID: %s", txId);
    await algodClient.sendRawTransaction(signedTxn.blob).do();

    // Wait for transaction to be confirmed
    const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);

    // Get the completed Transaction
    console.log("Transaction " + txId + " confirmed in round " + confirmedTxn["confirmed-round"]);

    // Get application id of deleted application and notify about completion
    let transactionResponse = await algodClient.pendingTransactionInformation(txId).do();
    let appId = transactionResponse['txn']['txn'].apid;
    console.log("Deleted app-id: ", appId);
}


// GET PRODUCTS: Use indexer
export const getMentorAction = async (address) => {
    console.log("Fetching products...")
    let note = new TextEncoder().encode(mentorNote);
    let encodedNote = Buffer.from(note).toString("base64");

    // Step 1: Get all transactions by notePrefix (+ minRound filter for performance)
    let transactionInfo = await indexerClient.searchForTransactions()
        .notePrefix(encodedNote)
        .txType("appl")
        .minRound(minRound)
        .do();
    let products = []
    for (const transaction of transactionInfo.transactions) {
        let appId = transaction["created-application-index"]
        if (appId) {
            // Step 2: Get each application by application id
            let mentor = await getApplication(appId, address)
            if (mentor) {
                products.push(mentor)
                console.log(mentor)
            }
        }
    }
    console.log("Products fetched.")
    return products
}

const getApplication = async (appId, senderAddress) => {
    try {
        // 1. Get application by appId
        let response = await indexerClient.lookupApplications(appId).includeAll(true).do();
        if (response.application.deleted) {
            return null;
        }
        let globalState = response.application.params["global-state"]

        // 2. Parse fields of response and return mentor
        let owner = response.application.params.creator
        let expertise = ""
        let description = ""
        let price = 0
        let buyers = 0
        let totalrating = 0
        let numberofraters = 0
        let amountdonated = 0
        let avgrating = 0
        let hasrated = 0
        let hasbought = 0

        const getField = (fieldName, globalState) => {
            return globalState.find(state => {
                return state.key === utf8ToBase64String(fieldName);
            })
        }

        if (getField("EXPERTISE", globalState) !== undefined) {
            let field = getField("EXPERTISE", globalState).value.bytes
            expertise = base64ToUTF8String(field)
        }

        if (getField("DESCRIPTION", globalState) !== undefined) {
            let field = getField("DESCRIPTION", globalState).value.bytes
            description = base64ToUTF8String(field)
        }

        if (getField("PRICE", globalState) !== undefined) {
            price = getField("PRICE", globalState).value.uint
        }

        if (getField("BUYERS", globalState) !== undefined) {
            buyers = getField("BUYERS", globalState).value.uint
        }

        if (getField("AVGRATING", globalState) !== undefined) {
            avgrating = getField("AVGRATING", globalState).value.uint
        }

        if (getField("NUMOFRATERS", globalState) !== undefined) {
            numberofraters = getField("NUMOFRATERS", globalState).value.uint
        }

        if (getField("AMOUNTDONATED", globalState) !== undefined) {
            amountdonated = getField("AMOUNTDONATED", globalState).value.uint
        }

        if (getField("TOTALRATING", globalState) !== undefined) {
            totalrating = getField("TOTALRATING", globalState).value.uint
        }

        let userInfo = await indexerClient.lookupAccountAppLocalStates(senderAddress).do();

        let appLocalState = userInfo["apps-local-states"];
        for (let i = 0; i < appLocalState.length; i++) {
          if (appId === appLocalState[i]["id"]) {
            let localState = appLocalState[i]["key-value"];

            if (getField("HASBOUGHT", localState) !== undefined) {
              hasbought = getField("HASBOUGHT",localState).value.uint;
            }
            if (getField("HASRATED", localState) !== undefined) {
              hasrated = getField("HASRATED", localState).value.uint;
            }
          }
        }

        return new Mentor(expertise, description,price, avgrating, numberofraters, totalrating, buyers,amountdonated, hasbought, hasrated, appId, owner)
    } catch (err) {
        return null;
    }
}