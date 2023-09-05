import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddresses } from "./constants.js"

const dummy = () => {
    console.log("ahhhhhhhhhhhhh")
}

let networkName, contractAddress

const connectButton = document.getElementById("connectButton")
const withdrawButton = document.getElementById("withdrawButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
connectButton.onclick = connect
withdrawButton.onclick = withdraw
fundButton.onclick = fund
balanceButton.onclick = getBalance

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await ethereum.request({ method: "eth_requestAccounts" })
            // const chainId = await getChainId()
            // console.log(chainId)
            assignContractAddress()
        } catch (error) {
            console.log(error)
        }
        connectButton.innerHTML = "Connected"
        const accounts = await ethereum.request({ method: "eth_accounts" })
        console.log(accounts)
    } else {
        connectButton.innerHTML = "Please install MetaMask"
    }
}

async function withdraw() {
    console.log(`Withdrawing...`)
    if (typeof window.ethereum !== "undefined") {
        assignContractAddress()
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        await provider.send("eth_requestAccounts", [])
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
            // await transactionResponse.wait(1)
        } catch (error) {
            console.log(error)
        }
    } else {
        withdrawButton.innerHTML = "Please install MetaMask"
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}...`)
    if (typeof window.ethereum !== "undefined") {
        assignContractAddress()
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            await listenForTransactionMine(transactionResponse, provider)
        } catch (error) {
            console.log(error)
        }
    } else {
        fundButton.innerHTML = "Please install MetaMask"
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        assignContractAddress()
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        console.log("hellloooo")
        try {
            const balance = await provider.getBalance(contractAddress)
            console.log(ethers.utils.formatEther(balance))
            const balanceDisplay = document.getElementById("balanceDisplay")
            balanceDisplay.innerHTML = `Balance: ${ethers.utils.formatEther(balance)} ETH`
        } catch (error) {
            console.log(error)
        }
    } else {
        balanceButton.innerHTML = "Please install MetaMask"
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}`)
    return new Promise((resolve, reject) => {
        try {
            provider.once(transactionResponse.hash, (transactionReceipt) => {
                console.log(`Completed with ${transactionReceipt.confirmations} confirmations. `)
                resolve()
            })
        } catch (error) {
            reject(error)
        }
    })
}

async function getChainId() {
    try {
        const chainIdHex = await ethereum.request({ method: "eth_chainId" })
        const chainId = parseInt(chainIdHex, 16)
        console.log("Chain ID:", chainId)
        return chainId
    } catch (error) {
        console.error("Error getting chain ID:", error)
    }
}

async function assignContractAddress() {
    const chainId = await getChainId()
    console.log("checking for the chain id: ", chainId)

    if (contractAddresses.hasOwnProperty(chainId)) {
        const networkInfo = contractAddresses[chainId]
        networkName = networkInfo.networkName
        contractAddress = networkInfo.contractAddress

        console.log(
            `For chainId ${chainId}, Network Name: ${networkName}, Contract Address: ${contractAddress}`
        )
        document.getElementById("network-name").innerHTML = `Ethereum: ${networkName}`
        document.getElementById("networks-list").innerHTML = ""
    } else {
        const availableNetworks = Object.values(contractAddresses).map((info) => info.networkName)
        alert(`Please switch to available networks: `, availableNetworks)
        console.log(
            `ChainId ${chainId} not found in the contractAddresses object. The available networks are: ${availableNetworks}`
        )
        document.getElementById(
            "networks-list"
        ).innerHTML = `Available Networks: ${availableNetworks}`
    }
}

// async function checkForAvailableNetworks(chainId) {}
