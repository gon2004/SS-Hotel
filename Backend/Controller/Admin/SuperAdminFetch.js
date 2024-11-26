const nodemailer = require('nodemailer');
const History = require('../../Models/AdminSchemas/RecycleBin');
const AdminAccts = require('../../Models/AdminSchemas/AdminSchema');
const Admin = require('../../Models/AdminSchemas/AdminSchema');


const fetchHistory = async (req,res) => {
    
    const history = await History.find();

    
    if(!history){
       return res.status(404).json({message:"Empty Room"});
    }

    return res.status(200).json({history});
}


const addAdmin = async (req,res) => {
    const {newAccount} = req.body;
    
    try{
        const email = await AdminAccts.findOne({email: newAccount.email});
    
        if(email){
           return res.status(404).json({message:"Email already exists"});
        }

        const code = Math.floor(Math.random() * (9999999999 - 1000000000 + 1)) + 1000000000;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_PASS,
            },
          });
          
          // async..await is not allowed in global scope, must use a wrapper
            // send mail with defined transport object
        const info = await transporter.sendMail({
            from: "SilverStone Hotel Management", 
            to: newAccount.email, 
            subject: "SilverStone Account", 
            text: `Greetings, ${newAccount.lastName} , ${newAccount.firstName}! 
                \n
                \n Welcome to our growing SilverStone Hotel family staff. we hope you're in a good condition.
                \n We would like to congratulate you for passing our screening. This email's purpose is to send you
                your account for our system. Please don't share your account to anyone to avoid  breaching your contact
                \n Username: ${newAccount.email} 
                \n Password: ${code} 
                \n
                \n
                Sincerely Yours, 
                SilverStone Management`, 
            });

            if(!info){
                return res.status(500).json({message: 'Adding new account failed'});
            }


            const newAdmin = new Admin({
                ...newAccount
            })
          
            return res.status(200).json({message: 'New Account Successfully Added'});

    
    }catch(err){
        console.log(err);
        return res.status(500);
    }
}


module.exports = {
    fetchHistory,
    addAdmin
};