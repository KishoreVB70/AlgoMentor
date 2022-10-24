import React, {useState} from "react";

//Styles
import './App.css';
import {Container, Nav} from "react-bootstrap";
import coverImg from "./assets/mentor.jpg"

import {indexerClient, myAlgoConnect} from "./utils/constants";

//Components
import Cover from "./components/Cover";
import Wallet from "./components/Wallet";
import {Notification} from "./components/utils/Notifications";
import Mentors from "./components/marketplace/Mentors"

const App = function AppWrapper() {
    const [address, setAddress] = useState(null);
    const [name, setName] = useState(null);
    const [balance, setBalance] = useState(0);

    const fetchBalance = async (accountAddress) => {
        indexerClient.lookupAccountByID(accountAddress).do()
            .then(response => {
                const _balance = response.account.amount;
                setBalance(_balance);
            })
            .catch(error => {
                console.log(error);
            });
    };

    const connectWallet = async () => {
        myAlgoConnect.connect()
            .then(accounts => {
                const _account = accounts[0];
                setAddress(_account.address);
                setName(_account.name);
                fetchBalance(_account.address);
            }).catch(error => {
            console.log('Could not connect to MyAlgo wallet');
            console.error(error);
        })
    };

    const disconnect = () => {
        setAddress(null);
        setName(null);
        setBalance(null);
    };

    return (
        <>
            <Notification />
            {address ? (
                <>
                    <div className="titlediv" >
                        <h1>
                            Algo Mentorship
                        </h1>
                    </div>    
                    <Container fluid="md">
                        <Nav className="justify-content-end pt-3 pb-5">
                            <Nav.Item>
                                <Wallet
                                    address={address}
                                    name={name}
                                    amount={balance}
                                    disconnect={disconnect}
                                    symbol={"ALGO"}
                                    />
                            </Nav.Item>
                        </Nav>
                        <main>
                            <Mentors address={address} fetchBalance={fetchBalance}/>
                        </main>
                    </Container>
                </>
            ) : (
                <Cover name={"Algo Mentor"} coverImg={coverImg} connect={connectWallet}/>
            )}
        </>
    );
}
export default App;
