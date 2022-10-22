from pyteal import *

class Mentor:

    class Variables:
        expertise = Bytes("EXPERTISE") #byte
        description = Bytes("DESCRIPTION") #byte
        image = Bytes("IMAGE") #byte
        price = Bytes("PRICE") # uint64
        avg_rating = Bytes("AVGRATING") #uint64
        num_of_raters = Bytes("NUMOFRATERS") #uint64
        total_rating = Bytes("TOTALRATING") #uint64
        buyers = Bytes("BUYERS") #uint64
        amount_donated = Bytes("AMOUNTDONATED") #uint64

    class AppMethods:
        buy = Bytes("buy")
        support = Bytes("support")
        rate = Bytes("rate")

    def application_creation(self):
        return Seq([
            Assert(Txn.application_args.length() == Int(4)),
            Assert(Txn.note() == Bytes("mentorship:k2")),

            App.globalPut(self.Variables.expertise, Txn.application_args[0]),
            App.globalPut(self.Variables.description, Txn.application_args[1]),
            App.globalPut(self.Variables.image, Txn.application_args[2]),
            App.globalPut(self.Variables.num_of_raters, Int(0)),
            App.globalPut(self.Variables.avg_rating, Int(0)),
            App.globalPut(self.Variables.price, Btoi(Txn.application_args[3])),
            
            App.globalPut(self.Variables.total_rating, Int(0)),
            App.globalPut(self.Variables.buyers, Int(0)),
            App.globalPut(self.Variables.amount_donated, Int(0)),

            Approve()
        ])
        
    def buy(self):
        valid_number_of_transactions = Global.group_size() == Int(2)
        hours = Txn.application_args[1]


        valid_payment_to_seller = And(
            Gtxn[1].type_enum() == TxnType.Payment,
            Gtxn[1].receiver() == Global.creator_address(),
            Gtxn[0].sender() != Global.creator_address(),
            Gtxn[1].amount() == App.globalGet(self.Variables.price) * Btoi(hours),
            Gtxn[1].sender() == Gtxn[0].sender(),
        )

        can_buy = And(valid_number_of_transactions,
                      valid_payment_to_seller)

        update_state = Seq([
            App.globalPut(self.Variables.buyers, App.globalGet(self.Variables.buyers) + Int(1)),
            Approve()
        ])

        return If(can_buy).Then(update_state).Else(Reject())

     
    # funciton -> rate
    def rate(self):
        valid_number_of_transactions = Global.group_size() == Int(1)
        # assert if user has bought the thing
        rating = Btoi(Txn.application_args[1])
        # Calculate and update the rating
        total_rating = App.globalGet(self.Variables.total_rating)
        numOfRators = App.globalGet(self.Variables.num_of_raters)

        correctValue =  And(rating > Int(0),
                            rating <= Int(5))

        canRate = And(correctValue,
                      valid_number_of_transactions)

        #update state
        update_state = Seq([
            App.globalPut(self.Variables.num_of_raters, Btoi(numOfRators) + Int(1) ),
            App.globalPut(self.Variables.total_rating, Btoi(total_rating) + rating),
            App.globalPut(self.Variables.avg_rating,  
                            Btoi(App.globalGet(self.Variables.total_rating)) / Btoi(self.Variables.num_of_raters)),
            Approve()
        ])
        return If(canRate).Then(update_state).Else(Reject())

    # Function -> Support 
    def support(self):
        valid_number_of_transactions = Global.group_size() == Int(2)
        amount = Btoi(Txn.application_args[1])

        valid_payment_to_seller = And(
            Gtxn[1].type_enum() == TxnType.Payment,
            Gtxn[1].receiver() == Global.creator_address(),
            Gtxn[1].amount() == amount,
            Gtxn[1].sender() == Gtxn[0].sender(),
        )

        canDonate= And(valid_number_of_transactions,
                        valid_payment_to_seller)

        update_state = Seq([
            App.globalPut(self.Variables.amount_donated, Btoi(App.globalGet(self.Variables.amount_donated)) + amount),
            Approve()
        ])

        return If(canDonate).Then(update_state).Else(Reject())


    def application_deletion(self):
        return Return(Txn.sender() == Global.creator_address())

    def application_start(self):
        return Cond(
            [Txn.application_id() == Int(0), self.application_creation()],
            [Txn.on_completion() == OnComplete.DeleteApplication, self.application_deletion()],
            [Txn.application_args[0] == self.AppMethods.buy, self.buy()],
            [Txn.application_args[0] == self.AppMethods.rate, self.rate()],
            [Txn.application_args[0] == self.AppMethods.support, self.support()],
        )
    def approval_program(self):
        return self.application_start()

    def clear_program(self):
        return Return(Int(1))
