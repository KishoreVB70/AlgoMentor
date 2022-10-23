from pyteal import *

class Mentor:

    class Variables:
        expertise = Bytes("EXPERTISE") #byte
        description = Bytes("DESCRIPTION") #byteyte
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
        changeprice = Bytes("changeprice")

    def application_creation(self):
        return Seq([
            Assert(Txn.application_args.length() == Int(3)),
            Assert(Txn.note() == Bytes("mentorship:k6")),

            App.globalPut(self.Variables.expertise, Txn.application_args[0]),
            App.globalPut(self.Variables.description, Txn.application_args[1]),
            App.globalPut(self.Variables.num_of_raters, Int(0)),
            App.globalPut(self.Variables.avg_rating, Int(0)),
            App.globalPut(self.Variables.price, Btoi(Txn.application_args[2])),
            
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

    # Function -> Support 
    def support(self):
        valid_number_of_transactions = Global.group_size() == Int(2)
        amount = Txn.application_args[1]

        valid_payment_to_seller = And(
            Gtxn[1].type_enum() == TxnType.Payment,
            Gtxn[1].receiver() == Global.creator_address(),
            Gtxn[1].sender() == Gtxn[0].sender(),
        )

        can_donate= And(valid_number_of_transactions,
                        valid_payment_to_seller,
                        Btoi(amount) > Int(0))

        update_state = Seq([
            App.globalPut(self.Variables.amount_donated, App.globalGet(self.Variables.amount_donated) + Btoi(amount)),
            Approve()
        ])

        return If(can_donate).Then(update_state).Else(Reject())
     
    # funciton -> rate
    def rate(self):
        # assert if user has bought the thing
        rating = Txn.application_args[1]

        correct_value =  And(Btoi(rating) > Int(0),
                            Btoi(rating) <= Int(5))

        not_owner = Txn.sender() != Global.creator_address()

        can_rate = And(correct_value,
                        not_owner)


        #update state
        update_state = Seq([
            Assert(Txn.application_args.length() == Int(2)),
            App.globalPut(self.Variables.num_of_raters, App.globalGet(self.Variables.num_of_raters) + Int(1)),
            App.globalPut(self.Variables.total_rating, App.globalGet(self.Variables.total_rating) + Btoi(rating)),
            App.globalPut(self.Variables.avg_rating,  
                            App.globalGet(self.Variables.total_rating) / App.globalGet(self.Variables.num_of_raters)),
            Approve()
        ])
        return If(can_rate).Then(update_state).Else(Reject())

    # Function for the owner to change the price
    def changeprice(self):

        is_owner = Txn.sender() == Global.creator_address()

        newprice = Txn.application_args[1]

        update_state = Seq([
            Assert(Txn.application_args.length() == Int(2)),
            App.globalPut(self.Variables.price, Btoi(newprice)),
            Approve()
        ])

        return If(is_owner).Then(update_state).Else(Reject())

    def application_deletion(self):
        return Return(Txn.sender() == Global.creator_address())

    def application_start(self):
        return Cond(
            [Txn.application_id() == Int(0), self.application_creation()],
            [Txn.on_completion() == OnComplete.DeleteApplication, self.application_deletion()],
            [Txn.application_args[0] == self.AppMethods.buy, self.buy()],
            [Txn.application_args[0] == self.AppMethods.rate, self.rate()],
            [Txn.application_args[0] == self.AppMethods.support, self.support()],
            [Txn.application_args[0] == self.AppMethods.changeprice, self.changeprice()]
        )
    def approval_program(self):
        return self.application_start()

    def clear_program(self):
        return Return(Int(1))
