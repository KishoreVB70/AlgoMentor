from pyteal import *

class Mentor:

    class GlobalVariables:
        expertise = Bytes("EXPERTISE") #byte
        description = Bytes("DESCRIPTION") #byte
        price = Bytes("PRICE") # uint64
        num_of_raters = Bytes("NUMOFRATERS") #uint64
        total_rating = Bytes("TOTALRATING") #uint64
        buyers = Bytes("BUYERS") #uint64
        amount_donated = Bytes("AMOUNTDONATED") #uint64
    
    class LocalVariables:
        has_bought = Bytes("HASBOUGHT") # bool, 0 -> false, 1 -> true
        has_rated = Bytes("HASRATED") # bool, 0 -> false, 1 -> true


    class AppMethods:
        buy = Bytes("buy")
        support = Bytes("support")
        rate = Bytes("rate")
        changeprice = Bytes("changeprice")

    def application_creation(self):
        return Seq([
            Assert(Txn.application_args.length() == Int(3)),
            Assert(Txn.note() == Bytes("mentorship:k9")),

            # Input checks
            Assert(Len(Txn.application_args[0]) > Int(3)),
            Assert(Len(Txn.application_args[1]) > Int(5)),
            Assert(Btoi(Txn.application_args[2]) > Int(0)),

            App.globalPut(self.GlobalVariables.expertise, Txn.application_args[0]),
            App.globalPut(self.GlobalVariables.description, Txn.application_args[1]),
            App.globalPut(self.GlobalVariables.num_of_raters, Int(0)),
            App.globalPut(self.GlobalVariables.price, Btoi(Txn.application_args[2])),
            
            App.globalPut(self.GlobalVariables.total_rating, Int(0)),
            App.globalPut(self.GlobalVariables.buyers, Int(0)),
            App.globalPut(self.GlobalVariables.amount_donated, Int(0)),

            Approve()
        ])
        
    # Optin function required by the local variables
    def setOptIn(self):
        return Seq([
            App.localPut(Txn.sender(), self.LocalVariables.has_bought, Int(0)),
            App.localPut(Txn.sender(), self.LocalVariables.has_rated, Int(0)),
            Approve()  
        ])


    # Buy function
    def buy(self):
        valid_number_of_transactions = Global.group_size() == Int(2)
        hours = Txn.application_args[1]


        valid_payment_to_seller = And(
            Btoi(hours) > Int(0),
            Gtxn[1].type_enum() == TxnType.Payment,
            Gtxn[1].receiver() == Global.creator_address(),
            Gtxn[0].sender() != Global.creator_address(),
            Gtxn[1].amount() == App.globalGet(self.GlobalVariables.price) * Btoi(hours),
            Gtxn[1].sender() == Gtxn[0].sender(),
        )

        can_buy = And(valid_number_of_transactions,
                      valid_payment_to_seller)

        update_state = Seq([
            App.globalPut(self.GlobalVariables.buyers, App.globalGet(self.GlobalVariables.buyers) + Int(1)),
            App.localPut(Txn.sender(), self.LocalVariables.has_bought, Int(1)),
            Approve()
        ])

        return If(can_buy).Then(update_state).Else(Reject())

    # Function for the user to donate as much amount as desired by them
    def support(self):
        valid_number_of_transactions = Global.group_size() == Int(2)
        amount = Txn.application_args[1]

        valid_payment_to_seller = And(
            Gtxn[1].sender() != Global.creator_address(),
            Gtxn[1].type_enum() == TxnType.Payment,
            Gtxn[1].receiver() == Global.creator_address(),
            Gtxn[1].sender() == Gtxn[0].sender(),
            Gtxn[1].amount() == Btoi(amount)
        )

        can_donate= And(valid_number_of_transactions,
                        valid_payment_to_seller,
                        Btoi(amount) > Int(0))

        update_state = Seq([
            App.globalPut(self.GlobalVariables.amount_donated, App.globalGet(self.GlobalVariables.amount_donated) + Btoi(amount)),
            Approve()
        ])

        return If(can_donate).Then(update_state).Else(Reject())
     
    # funciton -> rate
    def rate(self):
        # assert if user has bought the thing
        rating = Txn.application_args[1]

        # Value check for the rating to be between 1 and 5
        correct_value =  And(Btoi(rating) > Int(0),
                            Btoi(rating) <= Int(5))

        # Check to ensure the owner is not the caller
        not_owner = Txn.sender() != Global.creator_address()

        can_rate = And(correct_value,
                        not_owner,
                    )

        #update state
        update_state = Seq([
            # Checks to ensure that the user has bought the mentorship and has not yet rated
            Assert(App.localGet(Txn.sender(), self.LocalVariables.has_rated) == Int(0)),
            Assert(App.localGet(Txn.sender(), self.LocalVariables.has_bought) == Int(1)),

            Assert(Txn.application_args.length() == Int(2)),

            # State changes for calculating the rating
            App.globalPut(self.GlobalVariables.num_of_raters, App.globalGet(self.GlobalVariables.num_of_raters) + Int(1)),
            App.globalPut(self.GlobalVariables.total_rating, App.globalGet(self.GlobalVariables.total_rating) + Btoi(rating)),
            # sets hasrated so that the user cannot rate again
            App.localPut(Txn.sender(), self.LocalVariables.has_rated, Int(1)),
            Approve()
        ])
        return If(can_rate).Then(update_state).Else(Reject())

    # Function for the owner to change the price
    def changeprice(self):

        return Seq([
            # Checks if int is valid
            Assert(Btoi(Txn.application_args[1]) > Int(0)),

            # To ensure that the user does not change to the same price again
            Assert(self.GlobalVariables.price != Btoi(Txn.application_args[1])),

            # Checks if the caller is the owner
            Assert(Txn.sender() == Global.creator_address()),
            
            Assert(Txn.application_args.length() == Int(2)),
            App.globalPut(self.GlobalVariables.price, Btoi(Txn.application_args[1])),
            Approve()
        ])

    def application_deletion(self):
        return Return(Txn.sender() == Global.creator_address())

    def application_start(self):
        return Cond(
            [Txn.application_id() == Int(0), self.application_creation()],
            [Txn.on_completion() == OnComplete.DeleteApplication, self.application_deletion()],
            [Txn.on_completion() == OnComplete.OptIn, self.setOptIn()],
            [Txn.application_args[0] == self.AppMethods.buy, self.buy()],
            [Txn.application_args[0] == self.AppMethods.rate, self.rate()],
            [Txn.application_args[0] == self.AppMethods.support, self.support()],
            [Txn.application_args[0] == self.AppMethods.changeprice, self.changeprice()]
        )
    def approval_program(self):
        return self.application_start()

    def clear_program(self):
        return Return(Int(1))
