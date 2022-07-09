const mongoose = require('mongoose');

mongoose.connect("mongodb://root:example@localhost:27017/roadbook?authSource=admin", {
    useNewUrlParser: true,
})
    .then(() => {
        console.log("connected")
    })
    .catch((err) => {
        console.error(err)
    });


const customerSchema = mongoose.Schema({
    name: 'string',
    age: 'number',
    sex: 'string'
},
    {
        collection: 'newCustomer'
    }
);

const Customer = mongoose.model('Schema', customerSchema);

const customer1 = new Customer({name: "홍길동", age: "30", sex: "남"});

customer1.save().then(() => {
    console.log(customer1)
}).catch((err) => {
    console.error(err)
})

Customer.find((err, customer) => {
    console.log('read Model.find()');
    if(err){
        console.log(err)
    } else {
        console.log(customer)
    }
});

Customer.findById({_id: '62c925e282314fde27bd767f'}, (err, customer) => {
    console.log('update : modle.findbyid()');
    if(err) {
        console.log(err)
    }else{
        customer.name = 'modified';
        customer.save((err, modified_customer) => {
            if(err){
                console.log(err)
            }else{
                console.log(modified_customer)
            }
        })
    }
});
